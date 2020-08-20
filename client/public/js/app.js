const authenticateDevice = async () => {
  // kick off authentication flow
  fetch('/', {
    method: 'post'
  });
};

const callApi = async () => {
  try {
    await fetch('/workflows')
      .then(response => response.json())
      .then(data => renderWorkflowData(data));
  } catch (e) {
    console.error(e, 'error with api call');
    throw e;
  }
};

const renderWorkflowData = async dataToRender => {
  const wfContainer = document.getElementById('workflow-container');

  const {
    response: { entries }
  } = dataToRender;

  // TODO: use a frontend framework/ or templating library for better rendering,
  // this works for now but complications would arise at larger scales

  const workflowCard = entries.map(
    i =>
      `<div class="workflow-card">
        <h1>${i.name && i.name}</h1>
        <div>
          <div>
            <span><h2>Author</h2> ${i.author.id}</span>
            <span><h2>Date</h2> ${i.date}</span>
            <span><h2>Cost</h2> ${i.executionPrice}</span>
          </div>
        <div>
        <div>
          <h1>This workflow contains ${
            i.workflowComponents.length
          } components </h1>
            ${i.workflowComponents.map(
              (i, key) =>
                `<div class="workflow-card-workflows">
                  <h2>Component #${key}: ${i.label}</h2>
                  <span><h3>Settings</h3> ${
                    Object.keys(i.settings).length !== 0
                      ? i.settings
                      : 'no settings available'
                  } </span>
                  <span><h3>Type</h3>${i.type}</span>
                </div>`
            )}
            </div>
        </div>`
  );
  // check whether container is loaded in DOM then insert
  // the workflow html and data from API req
  if (wfContainer)
    wfContainer.insertAdjacentHTML(
      'afterbegin',
      workflowCard.join('').replace(/,/g, '')
    );
};
