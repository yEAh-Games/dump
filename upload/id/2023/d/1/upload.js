 // Replace the values below with your own GitLab project settings
    const gitlabUrl = 'https://gitlab.com';
    const projectId = '45086875';
    const apiToken = 'glpat-8qvrxD1ZL8yP6bTyCzKq';

    const uploadForm = document.getElementById('upload-form');
    const uploadMessage = document.getElementById('upload-message');
    uploadForm.addEventListener('submit', event => {
      event.preventDefault();
      const fileInput = document.querySelector('input[type=file]');
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result.split(',')[1];
        const formData = new FormData();
        formData.append('file', file);
        fetch(`${gitlabUrl}/api/v4/projects/${projectId}/uploads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`
          },
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
          }
          return response.json();
        })
        .then(upload => {
          console.log(`File uploaded successfully: ${upload.url}`);
          uploadMessage.textContent = `File uploaded successfully: ${upload.url}`;
          const fileName = upload.url.split('/').pop();
          fetch(`${gitlabUrl}/api/v4/projects/${projectId}/repository/commits`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              branch: 'main',
              commit_message: `Add ${fileName}.usercontent.1.dump.cloud to unsorted from: User-uploaded dump 1`,
              actions: [
                {
                  action: 'create',
                  file_path: `unsorted/${fileName}`,
                  content: '',
                  encoding: 'base64'
                },
                {
                  action: 'update',
                  file_path: `unsorted/${fileName}`,
                  content: fileContent,
                  encoding: 'base64'
                }
              ]
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to create commit: ${response.statusText}`);
            }
            return response.json();
          })
          .then(commit => {
            console.log(`Commit created successfully: ${commit.web_url}`);
            uploadMessage.textContent = `File uploaded and committed successfully: ${commit.web_url}`;
          })
          .catch(error => {
            console.error(error);
            uploadMessage.textContent = `Failed to upload and commit file: ${error.message}`;
          });
        })
        .catch(error => {
          console.error(error);
          uploadMessage.textContent = `Failed to upload file: ${error.message}`;
        });
      };
      reader.readAsDataURL(file);
    });
