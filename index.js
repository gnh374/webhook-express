import express from 'express';
import bodyParser from 'body-parser';
import * as k8s from '@kubernetes/client-node';

const app = express();
app.use(bodyParser.json());
const kc = new k8s.KubeConfig();
kc.loadFromCluster();

const k8sApi = kc.makeApiClient(k8s.BatchV1Api);

app.post('/api/trigger', async (req, res) => {


    async function createVeleroRestoreJob() {
        const jobName = `velero-restore-job-${Date.now()}`; // Unique job name
        const jobManifest = {
            apiVersion: "batch/v1",
            kind: "Job",
            metadata: {
                name: jobName,
                namespace: "velero"
            },
            spec: {
                template: {
                    spec: {
                        serviceAccountName: "velero-sa",
                        containers: [
                            {
                                name: "velero",
                                image: "velero/velero:v1.15.2",
                                command: ["/velero", "restore", "create", "--from-backup", "backup-nginx"]
                            }
                        ],
                        restartPolicy: "Never"
                    }
                }
            }
        };

        try {
            const response = await k8sApi.createNamespacedJob({ 
                namespace: "velero", 
                body: jobManifest 
                });
            console.log("Job created:", response.body);
            return response.body;
        } catch (error) {
            console.error("Error creating job:", error);
            throw error;
        }
    }

    try {
        await createVeleroRestoreJob();
        return res.status(200).json({ status: "success", message: "Velero restore job triggered" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Velero restore job", error: error.message });
    }
            
        
});

app.listen(3000, () => {
    console.log('Webhook server is running on port 3000');
});
