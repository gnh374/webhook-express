import express from 'express';
import { exec } from 'node:child_process';

import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;


// const k8sApi = kc.makeApiClient(k8s.CoreV1Api); // Or k8s.CustomObjectsApi for Velero


app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  if (req.body.status === "firing") {
    console.log("Alert firing! Triggering Velero restore...");
    const backupName = "backup-nginx"
    const command = `velero create restore --from-backup ${backupName} --namespace nginx`; // Customize flags as needed
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating restore: ${error}`);
        // Handle error
      } else {
        console.log(`Restore created successfully: ${stdout}`);
        // Handle success
      }
    });
 
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});