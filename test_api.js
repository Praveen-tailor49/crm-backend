const login = async (email) => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  const data = await res.json();
  return data.token;
};

const req = async (endpoint, method, token, body = null) => {
  const options = {
    method,
    headers: { 'Authorization': `Bearer ${token}` }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`http://localhost:5000/api${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('--- STARTING TESTS ---');

  // 1. Admin Tests
  console.log('\n[1] Admin Tests');
  const adminToken = await login('admin@crm.com');
  const adminUsers = await req('/users', 'GET', adminToken);
  console.log(`Admin get users: ${adminUsers.status} (expected 200)`);
  const adminRoles = await req('/roles', 'GET', adminToken);
  console.log(`Admin get roles: ${adminRoles.status} (expected 200)`);
  const adminLeads = await req('/leads', 'GET', adminToken);
  console.log(`Admin get leads: ${adminLeads.status} (expected 200)`);

  // 2. Manager Tests
  console.log('\n[2] Manager Tests');
  const managerToken = await login('manager@crm.com');
  const managerUsers = await req('/users', 'GET', managerToken);
  console.log(`Manager get users: ${managerUsers.status} (expected 403)`);
  const managerRoles = await req('/roles', 'GET', managerToken);
  console.log(`Manager get roles: ${managerRoles.status} (expected 403)`);
  
  const createLeadRes = await req('/leads', 'POST', managerToken, { name: 'Manager Lead', email: 'mgr@test.com' });
  console.log(`Manager create lead: ${createLeadRes.status} (expected 201)`);
  const leadId = createLeadRes.data.data?.id;

  if (leadId) {
    const editLeadRes = await req(`/leads/${leadId}`, 'PUT', managerToken, { name: 'Manager Lead Edited' });
    console.log(`Manager edit lead: ${editLeadRes.status} (expected 200)`);
  }

  // 3. Sales User Tests
  console.log('\n[3] Sales User Tests');
  const sales1Token = await login('sales1@crm.com');
  
  // Find a lead created by sales1
  const s1LeadsRes = await req('/leads', 'GET', sales1Token);
  const s1OwnLead = s1LeadsRes.data.data.find(l => l.assignedUser?.email === 'sales1@crm.com');
  const otherLead = s1LeadsRes.data.data.find(l => l.assignedUser?.email !== 'sales1@crm.com');

  if (s1OwnLead) {
    const editOwnRes = await req(`/leads/${s1OwnLead.id}`, 'PUT', sales1Token, { name: 'Sales1 Edited' });
    console.log(`Sales1 edit own lead: ${editOwnRes.status} (expected 200)`);
  }
  
  if (otherLead) {
    const editOtherRes = await req(`/leads/${otherLead.id}`, 'PUT', sales1Token, { name: 'Sales1 Try Edit Other' });
    console.log(`Sales1 edit other lead: ${editOtherRes.status} (expected 403)`);
  }

  // 4. Viewer Tests
  console.log('\n[4] Viewer Tests');
  const viewerToken = await login('viewer@crm.com');
  const viewerLeads = await req('/leads', 'GET', viewerToken);
  console.log(`Viewer get leads: ${viewerLeads.status} (expected 200)`);
  
  if (viewerLeads.data.data?.length > 0) {
    const firstLead = viewerLeads.data.data[0];
    const viewerEdit = await req(`/leads/${firstLead.id}`, 'PUT', viewerToken, { name: 'Viewer Edit' });
    console.log(`Viewer edit lead: ${viewerEdit.status} (expected 403)`);
    const viewerDelete = await req(`/leads/${firstLead.id}`, 'DELETE', viewerToken);
    console.log(`Viewer delete lead: ${viewerDelete.status} (expected 403)`);
  }

  // 5. Pagination & Filtering Tests
  console.log('\n[5] Pagination Tests (Admin)');
  const pageRes = await req('/leads?page=1&limit=2', 'GET', adminToken);
  console.log(`Pagination (limit=2): Got ${pageRes.data.data?.length} leads (expected 2)`);
  
  const searchRes = await req('/leads?search=Corp', 'GET', adminToken);
  console.log(`Search 'Corp': Found ${searchRes.data.data?.length} leads`);

  const sortRes = await req('/leads?sortBy=name&sortOrder=asc', 'GET', adminToken);
  if (sortRes.data.data?.length >= 2) {
    console.log(`Sort (ASC): 1st='${sortRes.data.data[0].name}', 2nd='${sortRes.data.data[1].name}'`);
  }

  console.log('\n--- TESTS COMPLETED ---');
};

runTests();
