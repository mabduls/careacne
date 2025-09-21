// src/server/services/auth-service.js
const {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    collection,
    doc,
    setDoc
} = require('../config/firebase');

const registerUser = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const usersCollection = collection(db, 'users');
        await setDoc(doc(usersCollection, user.uid), {
            name,
            email,
            createdAt: new Date().toISOString()
        });

        const token = await user.getIdToken();

        return {
            uid: user.uid,
            email: user.email,
            name,
            token: token
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // PERBAIKAN: Gunakan getIdToken() bukan accessToken
        const token = await user.getIdToken();

        return {
            uid: user.uid,
            email: user.email,
            token: token
        };
    } catch (error) {
        let message = 'Login failed';
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/invalid-credential':
                message = 'Invalid email or password';
                break;
            default:
                message = error.message;
        }
        throw new Error(message);
    }
};

const logoutUser = async () => {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.message);
    }
};

module.exports = { registerUser, loginUser, logoutUser };