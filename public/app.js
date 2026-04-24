function getToken() {
  return document.getElementById('adminToken').value.trim();
}

function toggleToken() {
  const input = document.getElementById('adminToken');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showAlert(message, type = 'success') {
  const area = document.getElementById('alert-area');
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  area.appendChild(alertEl);
  setTimeout(() => {
    if (alertEl.parentElement) alertEl.remove();
  }, 5000);
}

async function apiFetch(path, method = 'GET', body = null) {
  const token = getToken();
  if (!token) {
    showAlert('Please enter Admin Token first', 'warning');
    return null;
  }

  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

async function triggerAction(action) {
  const labels = {
    standup: 'Create Standup',
    remind: 'Send Reminder',
    summary: 'Generate Summary'
  };
  try {
    showAlert(`Executing: ${labels[action]}...`, 'info');
    const data = await apiFetch(`/api/trigger/${action}`, 'POST');
    if (!data) return;
    showAlert(`✓ ${labels[action]} completed successfully`, 'success');
    console.log('Result:', data);
  } catch (err) {
    showAlert(`Error: ${err.message}`, 'danger');
  }
}

async function loadMembers() {
  const container = document.getElementById('membersList');
  try {
    const members = await apiFetch('/api/members');
    if (!members) return;

    if (members.length === 0) {
      container.innerHTML = '<p class="text-muted">No members yet.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Notion ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${members.map((m) => `
            <tr>
              <td>${escapeHtml(m.name)}</td>
              <td>${escapeHtml(m.email)}</td>
              <td><code>${escapeHtml(m.notionId)}</code></td>
              <td>
                <button class="btn btn-small" onclick="deleteMember('${escapeHtml(m.notionId)}')">
                  <svg class="icon-small" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    showAlert(`Error loading members: ${err.message}`, 'danger');
  }
}

async function addMember() {
  const name = document.getElementById('newName').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const notionId = document.getElementById('newNotionId').value.trim();

  if (!name || !email || !notionId) {
    showAlert('Please fill in all member information', 'warning');
    return;
  }

  try {
    await apiFetch('/api/members', 'POST', { name, email, notionId });
    showAlert(`✓ Member ${name} added successfully`, 'success');
    document.getElementById('newName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newNotionId').value = '';
    loadMembers();
  } catch (err) {
    showAlert(`Error: ${err.message}`, 'danger');
  }
}

async function deleteMember(notionId) {
  if (!confirm(`Delete member with ID: ${notionId}?`)) return;
  try {
    await apiFetch(`/api/members/${notionId}`, 'DELETE');
    showAlert('✓ Member deleted successfully', 'success');
    loadMembers();
  } catch (err) {
    showAlert(`Error: ${err.message}`, 'danger');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadSummary() {
  const dateInput = document.getElementById('summaryDate').value;
  const button = event.target;

  if (!dateInput) {
    showAlert('Vui lòng chọn ngày', 'warning');
    return;
  }

  const originalText = button.innerText;
  button.disabled = true;
  button.innerText = 'Đang tải...';

  try {
    const data = await apiFetch(`/api/trigger/summary?date=${dateInput}`);
    if (!data) {
      button.disabled = false;
      button.innerText = originalText;
      return;
    }

    renderSummaryTable(data.result);
  } catch (err) {
    showAlert(`Error: ${err.message}`, 'danger');
  } finally {
    button.disabled = false;
    button.innerText = originalText;
  }
}

function initPage() {
  const summaryDateInput = document.getElementById('summaryDate');
  if (summaryDateInput) {
    const today = new Date().toISOString().split('T')[0];
    summaryDateInput.value = today;
  }
}

document.addEventListener('DOMContentLoaded', initPage);

function renderSummaryTable(result) {
  const container = document.getElementById('summaryResult');
  const { date, members } = result;

  if (!members || members.length === 0) {
    container.innerHTML = '<p class="text-muted">Không có dữ liệu standup cho ngày này.</p>';
    return;
  }

  const tableHtml = `
    <div style="margin-bottom: var(--spacing-md);">
      <p class="text-muted"><strong>Ngày:</strong> ${escapeHtml(date)} • <strong>Thành viên:</strong> ${members.length}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Thành viên</th>
          <th>Hôm qua</th>
          <th>Hôm nay</th>
          <th>Blocker</th>
        </tr>
      </thead>
      <tbody>
        ${members.map((m) => {
          const homQua = m.sections['Hôm qua'].length > 0 ? m.sections['Hôm qua'].join('\n') : '(chưa điền)';
          const homNay = m.sections['Hôm nay'].length > 0 ? m.sections['Hôm nay'].join('\n') : '(chưa điền)';
          const blocker = m.sections['Blocker'].length > 0 ? m.sections['Blocker'].join('\n') : '(chưa có)';
          const hasBlocker = m.sections['Blocker'].length > 0;

          return `
            <tr>
              <td><strong>${escapeHtml(m.name)}</strong></td>
              <td>${escapeHtml(homQua)}</td>
              <td>${escapeHtml(homNay)}</td>
              <td style="color: ${hasBlocker ? '#dc2626' : 'inherit'};">
                ${escapeHtml(blocker)}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHtml;
}
