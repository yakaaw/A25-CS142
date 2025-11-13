import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export const uploadFile = (file: File, path = 'attachments') => {
  return new Promise<{ url: string; progress: number }>((resolve, reject) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    let lastProgress = 0;

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        lastProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        // progress updated; final resolve will include the lastProgress value
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, progress: lastProgress || 100 });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};
