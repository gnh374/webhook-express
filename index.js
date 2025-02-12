import express from 'express';
import bodyParser from 'body-parser';
import * as k8s from '@kubernetes/client-node';

const app = express();
const PORT = process.env.PORT || 3000;


// const k8sApi = kc.makeApiClient(k8s.CoreV1Api); // Or k8s.CustomObjectsApi for Velero


app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  if (req.body.status === "firing") {
    console.log("Alert firing! Triggering Velero restore...");

    try {
      const backupName = "backup-nginx";
      const restoreName = `restore-${Date.now()}`;
      const namespace = "default";

      const restore = {
        apiVersion: 'velero.io/v1',
        kind: 'Restore',
        metadata: {
          name: restoreName,
          namespace: namespace,
        },
        spec: {
          backupName: backupName,
          // ... other restore options
        },
      };

     
      const kc = new k8s.KubeConfig();
      kc.loadFromDefault();
      console.log("kc "+ kc)
      

      const customObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);
      console.log(restore)
      console.log(namespace)
      console.log(customObjectsApi)
      const response = await customObjectsApi.createNamespacedCustomObject('velero.io', 'v1','default', 'restores', restore, undefined, undefined, undefined, undefined);

      console.log("Velero restore triggered:", response.body);
      res.status(202).json({ message: "Velero restore triggered", restoreName: restoreName });

    } catch (error) {
      console.error("Error triggering Velero restore:", error);
      res.status(500).json({ error: error.message });
    }

  } else {
    res.status(200).send("No action needed");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});