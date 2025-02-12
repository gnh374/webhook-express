import express from 'express';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';

const app = express();
app.use(bodyParser.json());

const KUBECTL_APPLY_JOB = `
apiVersion: batch/v1
kind: Job
metadata:
  name: velero-restore-job
  namespace: velero
spec:
  template:
    spec:
      serviceAccountName: velero
      restartPolicy: Never
      containers:
        - name: velero
          image: velero/velero:v1.15.2
          command: ["velero", "restore", "create", "--from-backup", "backup-nginx"]
`;

app.post('/api/trigger', (req, res) => {
    const data = req.body;

    if (data.alerts && data.alerts[0].status === "firing") {
        const alertName = data.alerts[0].labels.alertname;
        if (alertName === "Cluster2Down") {
            console.log("Cluster A is down! Creating Velero restore job...");

            // Run kubectl apply with the hardcoded YAML job
            const kubectl = spawn('kubectl', ['apply', '-f', '-']);
            kubectl.stdin.write(KUBECTL_APPLY_JOB);
            kubectl.stdin.end();

            kubectl.stdout.on('data', (data) => console.log(`stdout: ${data}`));
            kubectl.stderr.on('data', (data) => console.error(`stderr: ${data}`));

            kubectl.on('close', (code) => {
                if (code === 0) {
                    res.status(200).json({ status: "success", message: "Velero restore job triggered" });
                } else {
                    res.status(500).json({ status: "error", message: `kubectl apply failed with code ${code}` });
                }
            });
            return;
        }
    }

    res.status(400).json({ status: "ignored", message: "No relevant alert received" });
});

app.listen(3000, () => {
    console.log('Webhook server is running on port 3000');
});
