// Gunakan Firebase REST API instead of Firebase SDK
const FIREBASE_API_KEY = "AIzaSyC0E89l78RZxPmE-IUb7YIqhdx5WISs_1I"

export async function handleRegister(request) {
    try {
        const { email, password, name } = await request.json()

        // Register dengan Firebase REST API
        const signUpResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            }
        )

        const signUpData = await signUpResponse.json()

        if (!signUpResponse.ok) {
            throw new Error(signUpData.error.message || 'Registration failed')
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                uid: signUpData.localId,
                email: signUpData.email,
                name: name,
                token: signUpData.idToken
            }
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        let message = 'Registration failed'
        const errorMsg = error.message.toLowerCase()
        
        if (errorMsg.includes('email_exists')) {
            message = 'Email already registered'
        } else if (errorMsg.includes('invalid_email')) {
            message = 'Invalid email address'
        } else if (errorMsg.includes('weak_password')) {
            message = 'Password should be at least 6 characters'
        }
        
        throw { message, status: 400 }
    }
}

export async function handleVerify(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No token provided'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const token = authHeader.substring(7);
        
        // Verifikasi token dengan Firebase REST API
        const verifyResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: token })
            }
        );

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: verifyData.error?.message || 'Token verification failed'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                uid: verifyData.users[0].localId,
                email: verifyData.users[0].email
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export async function handleLogin(request) {
    try {
        const { email, password } = await request.json()

        // Login dengan Firebase REST API
        const signInResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            }
        )

        const signInData = await signInResponse.json()

        if (!signInResponse.ok) {
            throw new Error(signInData.error.message || 'Login failed')
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                uid: signInData.localId,
                email: signInData.email,
                token: signInData.idToken
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        let message = 'Login failed'
        const errorMsg = error.message.toLowerCase()
        
        if (errorMsg.includes('invalid_email')) {
            message = 'Invalid email address'
        } else if (errorMsg.includes('user_disabled')) {
            message = 'This account has been disabled'
        } else if (errorMsg.includes('email_not_found')) {
            message = 'No account found with this email'
        } else if (errorMsg.includes('invalid_password')) {
            message = 'Incorrect password'
        } else if (errorMsg.includes('invalid_credential')) {
            message = 'Invalid email or password'
        }
        
        throw { message, status: 401 }
    }
}

export async function handleLogout(request) {
    try {
        return new Response(JSON.stringify({
            success: true,
            message: 'Logout successful'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        throw { message: error.message, status: 500 }
    }
}