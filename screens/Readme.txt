INITIAL SETUP
GO TO CLERK WEBSITE AND CREATE PROJECT/APPLICATION https://clerk.dev/ and create an account
THEN COPY THE publishableKey FROM CONFIGURE->API Keys
GO TO SSO CONNECTION AND CLICK ON GOOGLE->USE CUSTOM CREDENTIALS  AND COPY redirectUrl

GO TO GOOGLE CLOUD PLATFORM AND CREATE A PROJECT
LEFT SIDE BAR GO TO APIs & SERVICES-> CREDENTIALS
COPY CLIENT ID AND CLIENT SECRET AND PASTE INTO YOUR CLERK APP
AND IN GOOGLE CLOUD PLATFORM GO TO APIs & SERVICES-> CREDENTIALS-> aUTHORIZED REDIRECT URLS AND PASTE THE redirectUrl copied from the clerk app



STEP 1: Clerk Google Auth Function:
copy the function below where your AuthScreen is:
NOTE : Update the redirectUrl with the exact URL from your new Clerk app

const handleGoogleAuth = async () => {
    try {
      if (!googleAuth) throw new Error("Google OAuth is not initialized")

      console.log("Starting Google OAuth flow...")
      
      // For mobile and web compatibility
      const redirectUrl = Platform.OS === 'web' 
        ? "https://divine-cub-68.clerk.accounts.dev/v1/oauth_callback" // Update with the exact URL from your new Clerk app
        : undefined;
        
      console.log("Using redirectUrl:", redirectUrl);
      
      // Start OAuth flow with enhanced error logging
      const result = await googleAuth({
        redirectUrl
      }).catch(error => {
        console.error("GoogleAuth error caught:", error);
        throw error;
      });
      
      if (!result) {
        console.log("OAuth result is null or undefined");
        return;
      }
      
      console.log("OAuth result full:", JSON.stringify(result, null, 2));
      
      const { createdSessionId, setActive } = result;

      if (createdSessionId) {
        console.log("Session created successfully:", createdSessionId);
        if (setActive) {
          try {
            await setActive({ session: createdSessionId });
            console.log("Session activated");
            await fetchUserData();
            
            // This will trigger the root component to re-render with isSignedIn=true
            console.log("Auth successful, calling onLogin callback");
            onLogin();
          } catch (setActiveError) {
            console.error("Error activating session:", setActiveError);
            Alert.alert("Error", "Authentication successful but session activation failed");
          }
        } else {
          console.error("setActive function is undefined");
          Alert.alert("Error", "Authentication successful but session activation failed");
        }
      } else {
        console.log("No session ID created - user may have cancelled or another error occurred");
      }
    } catch (err) {
      console.error("Google OAuth error details:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Authentication Error", 
        `Failed to authenticate with Google: ${err instanceof Error ? err.message : "Unknown error"}. Please check console logs.`
      );
    }
  }

STEP 2: Change your google button with the following:

<TouchableOpacity
style={[
    styles.socialButton,
    {
    backgroundColor: getInputBgColor(),
    borderColor: getInputBorderColor(),
    },
]}
onPress={handleGoogleAuth}
>
    <Text style={{ color: getTextColor() }}>Google</Text>
</TouchableOpacity>


STEP 3: Add the following in the App.tsx
NOTE: Update the publishableKey with the exact key from your new Clerk app


export default function App() {
    return (
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey="pk_test_ZGl2aW5lLWN1Yi02OC5jbGVyay5hY2NvdW50cy5kZXYk"
      >
        ...Remaining code...


      </ClerkProvider>
    );
}



