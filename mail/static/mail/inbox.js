document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-view').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        console.log(emails);
        emails.forEach(single_email => {
          const element = document.createElement('div');
          console.log(single_email);
          element.innerHTML = `
          <div class="card bg-light text-dark" id="read">
          <div class="card-body">
          ${single_email.sender} <span class="tab"></span><span class="tab"></span>${single_email.subject} <span class="tab"></span><span class="tab"></span><span class="tab"></span>${single_email.timestamp}
          </div>
          </div>
          <p></p>
      `;
          if (single_email.read === true) {
            element.innerHTML=`<div class="read" id="read">
            <div class="card-body">
            ${single_email.sender} <span class="tab"></span><span class="tab"></span>${single_email.subject} <span class="tab"></span><span class="tab"></span><span class="tab"></span>${single_email.timestamp}
            </div>
            </div>
            <p></p>`;
          }

      
          element.addEventListener('click', function() {
              console.log(`This element has been clicked! ${single_email.id}`);
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#email-view').style.display = 'block';
              fetch(`/emails/${single_email.id}`)
              .then(response => response.json())
              .then(email => {
                  // Print email
                  console.log(email);

                  // ... do something else with email ...
                  document.querySelector('#email-view').innerHTML = `<h3>Subject: ${email.subject}</h3>
                  <p>Sender: ${email.sender}</p>
                  <p>Recipients: ${email.recipients}</p>
                  <p>TImestamp: ${email.timestamp}</p>
                  <hr>
                  <h5>Body:</h5>
                  <p>${email.body}</p>
                  <hr>
                  `;
                  // Adding archive button
                  if (mailbox === 'inbox') {
                    const archive_button = document.createElement('button');
                    archive_button.innerHTML = 'Archive';
                    archive_button.className += "btn btn-warning";
                    archive_button.addEventListener('click', function() {
                      fetch(`/emails/${single_email.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            archived: true
                        })
                      })
                      location.reload();
                      load_mailbox('archive');
                        
                    });
                    document.querySelector('#email-view').append(archive_button);


                    // Adding reply button
                    let reply_button = document.createElement('button');
                    reply_button.className += "btn btn-info";
                    reply_button.innerHTML = 'Reply';
                    reply_button.addEventListener('click', function() {
                      compose_email();
                      document.querySelector('#compose-recipients').value = `${email.sender}`;
                      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
                      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: 
                      ${email.body}`;
                    })
                    document.querySelector('#email-view').append(reply_button);

         }
                
                  if (mailbox === 'archive') {
                    const unarchive_button = document.createElement('button');
                    unarchive_button.innerHTML = 'Unarchive';
                    unarchive_button.className += "btn btn-warning";
                    unarchive_button.addEventListener('click', function() {
                      fetch(`/emails/${single_email.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            archived: false
                        })
                      })
                      location.reload(); 
                      load_mailbox('inbox');
                       
                    });
                    document.querySelector('#email-view').append(unarchive_button);
                  }

                });
                fetch(`/emails/${single_email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                  })
                })


        
          });
          
    document.querySelector('#emails-view').append(element);
      
});
    });
}

function send_email(event) {
        event.preventDefault();
        
        // Get the values from the form
        const recipients = document.querySelector('#compose-recipients').value;
        const subject = document.querySelector('#compose-subject').value;
        const body = document.querySelector('#compose-body').value;
        console.log(recipients, subject, body);
        fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
              recipients: `${recipients}`,
              subject: `${subject}`,
              body: `${body}`
          })
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
        });
        load_mailbox('sent');

};