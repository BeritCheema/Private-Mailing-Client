document.addEventListener('DOMContentLoaded', function() {


  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").onsubmit = send_email;

  load_mailbox('inbox');
});

function compose_email() {


  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#view-emails").style.display = "none";

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  

  document.querySelector("#emails-view").style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none'; 
  document.querySelector("#view-emails").style.display = "none";
  document.querySelector("#emails-view").innerHTML = "";


  const cool = document.querySelector(`#${mailbox}`);

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    emails.forEach(email => {
      console.log(email);
      const element = document.createElement('div');
      if(email.read) {element.style = "border: 1px solid #ddd; border-radius: 5px; background-color: #C0C0C0	; color: black; padding: 10px; margin-bottom: 10px;";}
      else {element.style = "border: 1px solid #ddd; border-radius: 5px; background-color: #fff; color: black; padding: 10px; margin-bottom: 10px;";}
      element.innerHTML = `
        <h5>Sender: ${email.sender} </h5>
        <h5>Subject: ${email.subject} </h5>
        <h6>Sender: ${email.timestamp} </h6>
      `;
      element.addEventListener("click", () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
        get_email(email);
      })
      document.querySelector('#emails-view').append(element);
    });
});
}

function send_email() {
  const body = document.querySelector("#compose-body").value;
  const rec = document.querySelector('#compose-recipients').value;
  const sub = document.querySelector('#compose-subject').value;
  console.log(body);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: rec,
        subject: sub,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {

      console.log(result);
      load_mailbox("sent")
  });
  return false
}

function get_email(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#view-emails").style.display = "block";

  const divider = document.querySelector("#view-emails");
  divider.innerHTML = "";
  const num = email.id;
  divider.innerHTML = `
  <div style="margin: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
    <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
      <div>From: <span class="email-from">${email.sender}</span></div>
      <div>To: <span class="email-to">${email.recipients.join(', ')}</span></div>
    </div>
    <div style="font-weight: bold;">Subject: ${email.subject}</div>
    <div style="white-space: pre-wrap;">${email.body}</div>
    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.8em;">
      <div>Sent: <span class="email-timestamp">${email.timestamp}</span></div>
      <div>Status: <span class="email-read">${email.read ? 'Read' : 'Unread'}</span>, <span class="email-archived">${email.archived ? 'Archived' : 'Not Archived'}</span>
      ${!email.archived ? 
        `<button style="margin-left: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="archiveEmail(${email.id})">Archive</button>` : 
        `<button style="margin-left: 10px; padding: 5px 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="unarchiveEmail(${email.id})">Unarchive</button>`
      }
      </div>
    </div>
  </div>
  <button onclick=reply(${num})>Reply</button>
  `;
}

function archiveEmail(emailID) {
  fetch(`/emails/${emailID}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: true
    })
  })
}

function unarchiveEmail(emailID) {
  fetch(`/emails/${emailID}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: false
    })
  })
}

function reply(emailID) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#view-emails").style.display = "none";
  
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    let sub = email.subject;
    if(sub.substring(0,3) == "Re:") {document.querySelector('#compose-subject').value = `${email.subject}`;}
    else {document.querySelector('#compose-subject').value = `Re: ${email.subject}`;}
    document.querySelector('#compose-body').value = '';
  });
}