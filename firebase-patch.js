// This is a patch script to fix the Firebase module imports
const fs = require('fs');
const path = require('path');

// Path to the problematic file
const firestoreIndexPath = path.join(__dirname, 'node_modules', '@react-native-firebase', 'firestore', 'lib', 'index.js');

// Check if the file exists
if (fs.existsSync(firestoreIndexPath)) {
  console.log('Patching Firebase Firestore module...');
  
  // Read the file content
  let content = fs.readFileSync(firestoreIndexPath, 'utf8');
  
  // Replace directory imports with specific file imports
  content = content.replace(
    /from ['"]@react-native-firebase\/app\/lib\/common['"]/g, 
    'from "@react-native-firebase/app/lib/common/index.js"'
  );
  
  // Write the modified content back to the file
  fs.writeFileSync(firestoreIndexPath, content, 'utf8');
  
  console.log('Patching complete!');
} else {
  console.log('Firestore index file not found - skipping patch');
}

// Also patch other Firebase modules if needed
const authIndexPath = path.join(__dirname, 'node_modules', '@react-native-firebase', 'auth', 'lib', 'index.js');
const storageIndexPath = path.join(__dirname, 'node_modules', '@react-native-firebase', 'storage', 'lib', 'index.js');

// Patch Auth module
if (fs.existsSync(authIndexPath)) {
  console.log('Patching Firebase Auth module...');
  
  let content = fs.readFileSync(authIndexPath, 'utf8');
  
  content = content.replace(
    /from ['"]@react-native-firebase\/app\/lib\/common['"]/g, 
    'from "@react-native-firebase/app/lib/common/index.js"'
  );
  
  fs.writeFileSync(authIndexPath, content, 'utf8');
  
  console.log('Auth module patched!');
}

// Patch Storage module
if (fs.existsSync(storageIndexPath)) {
  console.log('Patching Firebase Storage module...');
  
  let content = fs.readFileSync(storageIndexPath, 'utf8');
  
  content = content.replace(
    /from ['"]@react-native-firebase\/app\/lib\/common['"]/g, 
    'from "@react-native-firebase/app/lib/common/index.js"'
  );
  
  fs.writeFileSync(storageIndexPath, content, 'utf8');
  
  console.log('Storage module patched!');
}

// Patch Firebase app module if needed
const appIndexPath = path.join(__dirname, 'node_modules', '@firebase', 'app', 'dist', 'index.js');
if (fs.existsSync(appIndexPath)) {
  console.log('Checking Firebase app module...');
  
  let content = fs.readFileSync(appIndexPath, 'utf8');
  if (content.includes('require.resolve')) {
    console.log('Patching Firebase app module...');
    content = content.replace(
      /require\.resolve/g,
      'function(path) { return path; }'
    );
    fs.writeFileSync(appIndexPath, content, 'utf8');
    console.log('Firebase app module patched!');
  }
}

console.log('Firebase patching process completed!');

