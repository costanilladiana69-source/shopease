// Test Firebase Storage configuration
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app } from '../firebaseConfig';

const storage = getStorage(app);

export const testStorageConnection = async () => {
  try {
    console.log('Testing Firebase Storage connection...');
    
    // Create a test reference
    const testRef = ref(storage, 'test/test-file.txt');
    
    // Create a simple text blob
    const testBlob = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    
    // Try to upload
    console.log('Uploading test file...');
    const uploadResult = await uploadBytes(testRef, testBlob);
    console.log('Upload successful:', uploadResult);
    
    // Try to get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('Download URL:', downloadURL);
    
    return { success: true, downloadURL };
  } catch (error) {
    console.error('Storage test failed:', error);
    return { success: false, error: error.message };
  }
};
