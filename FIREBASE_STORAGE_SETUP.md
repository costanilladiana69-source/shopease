ve# Firebase Storage Setup Guide

## Common Issues and Solutions

### 1. Storage Rules Configuration

The most common cause of "unknown error" in Firebase Storage is incorrect security rules.

**Go to Firebase Console → Storage → Rules**

Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile pictures
    match /profile-pictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload any file in their user folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload product images
    match /products/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // Allow public read access to profile pictures (optional)
    match /profile-pictures/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Storage Bucket Configuration

**Check Firebase Console → Storage → Files**

1. Ensure the storage bucket is created
2. Check if the bucket name matches your config
3. Verify the bucket is in the same region as your app

### 3. Authentication Requirements

Make sure the user is properly authenticated before attempting upload:

```javascript
// Check if user is authenticated
if (!user || !user.id) {
  throw new Error('User not authenticated');
}
```

### 4. File Size Limits

Firebase Storage has limits:
- Maximum file size: 32 MB
- Maximum upload size: 5 GB

For profile pictures, keep images under 5 MB.

### 5. Network Configuration

Ensure your app has proper network access:
- Check internet connection
- Verify Firebase project is active
- Check if there are any firewall restrictions

### 6. Debugging Steps

1. **Check Console Logs**: Look for detailed error messages
2. **Test Storage Rules**: Use Firebase Console to test rules
3. **Verify Authentication**: Ensure user is logged in
4. **Check File Format**: Ensure image is valid JPEG/PNG
5. **Test with Small File**: Try uploading a very small image first

### 7. Alternative Upload Method

If the current method fails, try this alternative:

```javascript
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const uploadImageAlternative = async (uri, userId) => {
  const storage = getStorage();
  const imageRef = ref(storage, `profile-pictures/${userId}-${Date.now()}.jpg`);
  
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const uploadTask = uploadBytesResumable(imageRef, blob);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
      (snapshot) => {
        // Progress callback
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};
```

### 8. Testing Storage Connection

Use the test utility to verify storage is working:

```javascript
import { testStorageConnection } from './utils/testStorage';

// Test the connection
const testResult = await testStorageConnection();
console.log('Storage test result:', testResult);
```

## Quick Fix Checklist

- [ ] Check Firebase Storage rules (ensure /products/ path is allowed for authenticated users)
- [ ] Verify user authentication
- [ ] Test with small image file
- [ ] Check network connection
- [ ] Verify Firebase project is active
- [ ] Check console for detailed error messages
- [ ] Ensure image format is supported (JPEG/PNG)
