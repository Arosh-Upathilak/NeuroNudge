package com.avidz.NeuroNudge.ui

import android.util.Patterns
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.MarkEmailRead
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Spa
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

private const val MinimumPasswordLength = 6

@Composable
fun LoginScreen(
    onLogin: (email: String, password: String) -> Unit,
    onGoogleClick: () -> Unit,
    onSignUpClick: () -> Unit,
    onForgotPasswordClick: () -> Unit,
    modifier: Modifier = Modifier,
    initialEmail: String = "",
    isLoading: Boolean = false,
    errorMessage: String? = null,
) {
    var email by rememberSaveable { mutableStateOf(initialEmail) }
    var password by rememberSaveable { mutableStateOf("") }
    var emailError by rememberSaveable { mutableStateOf<String?>(null) }
    var passwordError by rememberSaveable { mutableStateOf<String?>(null) }

    fun submit() {
        emailError = validateEmail(email)
        passwordError = validatePassword(password)
        if (emailError == null && passwordError == null) onLogin(email.trim(), password)
    }

    AuthForm(
        title = "Welcome back",
        subtitle = "A gentle space for the moments that matter.",
        modifier = modifier,
    ) {
        NeuroNudgeTextField(
            value = email,
            onValueChange = { email = it; emailError = null },
            label = "Email",
            placeholder = "you@example.com",
            errorMessage = emailError,
            leadingIcon = Icons.Rounded.Email,
            enabled = !isLoading,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
        )
        NeuroNudgeTextField(
            value = password,
            onValueChange = { password = it; passwordError = null },
            label = "Password",
            errorMessage = passwordError,
            leadingIcon = Icons.Rounded.Lock,
            isPassword = true,
            enabled = !isLoading,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { submit() }),
        )
        TextButton(
            onClick = onForgotPasswordClick,
            modifier = Modifier.align(Alignment.End),
            enabled = !isLoading,
        ) {
            Text("Forgot password?")
        }
        if (errorMessage != null) ErrorMessage(errorMessage)
        PrimaryButton("Log in", onClick = { submit() }, isLoading = isLoading)
        OutlinedButton(
            onClick = onGoogleClick,
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Continue with Google") }
        AuthSwitchPrompt("New to NeuroNudge?", "Create account", onSignUpClick, !isLoading)
    }
}

@Composable
fun SignUpScreen(
    onSignUp: (name: String, email: String, password: String) -> Unit,
    onLoginClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    errorMessage: String? = null,
) {
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var nameError by rememberSaveable { mutableStateOf<String?>(null) }
    var emailError by rememberSaveable { mutableStateOf<String?>(null) }
    var passwordError by rememberSaveable { mutableStateOf<String?>(null) }
    var acceptedTerms by rememberSaveable { mutableStateOf(false) }
    var termsError by rememberSaveable { mutableStateOf<String?>(null) }

    fun submit() {
        nameError = if (name.isBlank()) "Enter your name." else null
        emailError = validateEmail(email)
        passwordError = validatePassword(password)
        termsError = if (!acceptedTerms) "Accept the Terms and Privacy Policy to continue." else null
        if (nameError == null && emailError == null && passwordError == null && termsError == null) {
            onSignUp(name.trim(), email.trim(), password)
        }
    }

    AuthForm(
        title = "Create your space",
        subtitle = "Start keeping memories close, one nudge at a time.",
        modifier = modifier,
    ) {
        NeuroNudgeTextField(
            value = name,
            onValueChange = { name = it; nameError = null },
            label = "Name",
            errorMessage = nameError,
            leadingIcon = Icons.Rounded.Person,
            enabled = !isLoading,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
        )
        NeuroNudgeTextField(
            value = email,
            onValueChange = { email = it; emailError = null },
            label = "Email",
            placeholder = "you@example.com",
            errorMessage = emailError,
            leadingIcon = Icons.Rounded.Email,
            enabled = !isLoading,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
        )
        NeuroNudgeTextField(
            value = password,
            onValueChange = { password = it; passwordError = null },
            label = "Password",
            placeholder = "At least 6 characters",
            errorMessage = passwordError,
            leadingIcon = Icons.Rounded.Lock,
            isPassword = true,
            enabled = !isLoading,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { submit() }),
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
                checked = acceptedTerms,
                onCheckedChange = { acceptedTerms = it; termsError = null },
                enabled = !isLoading,
            )
            Text("I accept the Terms and Conditions and Privacy Policy", style = MaterialTheme.typography.bodySmall)
        }
        if (termsError != null) ErrorMessage(termsError!!)
        if (errorMessage != null) ErrorMessage(errorMessage)
        PrimaryButton("Create account", onClick = { submit() }, isLoading = isLoading)
        AuthSwitchPrompt("Already have an account?", "Log in", onLoginClick, !isLoading)
    }
}

@Composable
fun VerifyEmailScreen(
    email: String,
    onCheckVerification: () -> Unit,
    onResendEmail: () -> Unit,
    onBackToLogin: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    isResending: Boolean = false,
    errorMessage: String? = null,
) {
    AuthMessageScreen(
        icon = Icons.Rounded.MarkEmailRead,
        title = "Verify your email",
        message = "We sent a verification link to\n$email\n\nOpen it, then return here to continue.",
        modifier = modifier,
    ) {
        if (errorMessage != null) ErrorMessage(errorMessage, Modifier.fillMaxWidth())
        PrimaryButton("I've verified my email", onCheckVerification, isLoading = isLoading)
        TextButton(onClick = onResendEmail, enabled = !isLoading && !isResending) {
            Text(if (isResending) "Sending..." else "Resend email")
        }
        TextButton(onClick = onBackToLogin, enabled = !isLoading && !isResending) {
            Text("Back to login")
        }
    }
}

@Composable
fun BootstrapFailureScreen(
    errorMessage: String,
    onRetry: () -> Unit,
    onSignOut: () -> Unit,
    isLoading: Boolean = false,
    modifier: Modifier = Modifier,
) {
    AuthMessageScreen(
        icon = Icons.Rounded.Spa,
        title = "We couldn't finish setting up your account",
        message = errorMessage,
        modifier = modifier,
    ) {
        PrimaryButton("Retry", onRetry, isLoading = isLoading)
        TextButton(onClick = onSignOut, enabled = !isLoading) { Text("Sign out") }
    }
}

@Composable
fun ForgotPasswordScreen(
    onSendResetLink: (email: String) -> Unit,
    onBackToLogin: () -> Unit,
    modifier: Modifier = Modifier,
    initialEmail: String = "",
    isLoading: Boolean = false,
    errorMessage: String? = null,
) {
    var email by rememberSaveable { mutableStateOf(initialEmail) }
    var emailError by rememberSaveable { mutableStateOf<String?>(null) }

    fun submit() {
        emailError = validateEmail(email)
        if (emailError == null) onSendResetLink(email.trim())
    }

    AuthForm(
        title = "Reset your password",
        subtitle = "Enter your email and we'll send you a secure reset link.",
        modifier = modifier,
    ) {
        NeuroNudgeTextField(
            value = email,
            onValueChange = { email = it; emailError = null },
            label = "Email",
            placeholder = "you@example.com",
            errorMessage = emailError,
            leadingIcon = Icons.Rounded.Email,
            enabled = !isLoading,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { submit() }),
        )
        if (errorMessage != null) ErrorMessage(errorMessage)
        PrimaryButton("Send reset link", onClick = { submit() }, isLoading = isLoading)
        TextButton(onClick = onBackToLogin, modifier = Modifier.align(Alignment.CenterHorizontally), enabled = !isLoading) {
            Text("Back to login")
        }
    }
}

@Composable
fun CheckEmailScreen(
    email: String,
    onOpenEmail: () -> Unit,
    onBackToLogin: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AuthMessageScreen(
        icon = Icons.Rounded.CheckCircle,
        title = "Check your inbox",
        message = "We sent password reset instructions to\n$email",
        modifier = modifier,
    ) {
        PrimaryButton("Open email app", onOpenEmail)
        TextButton(onClick = onBackToLogin) { Text("Back to login") }
    }
}

@Composable
private fun AuthForm(
    title: String,
    subtitle: String,
    modifier: Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .navigationBarsPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 28.dp),
    ) {
        BrandMark()
        Spacer(Modifier.height(38.dp))
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(10.dp))
        Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(30.dp))
        Column(verticalArrangement = Arrangement.spacedBy(14.dp), content = content)
    }
}

@Composable
private fun AuthMessageScreen(
    icon: ImageVector,
    title: String,
    message: String,
    modifier: Modifier,
    actions: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer) {
            Box(Modifier.size(92.dp), contentAlignment = Alignment.Center) {
                Icon(icon, null, Modifier.size(44.dp), tint = MaterialTheme.colorScheme.onPrimaryContainer)
            }
        }
        Spacer(Modifier.height(28.dp))
        Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(12.dp))
        Text(
            message,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(32.dp))
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp),
            content = actions,
        )
    }
}

@Composable
private fun BrandMark() {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer) {
            Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) {
                Icon(Icons.Rounded.Spa, null, Modifier.size(24.dp), tint = MaterialTheme.colorScheme.onPrimaryContainer)
            }
        }
        Text("NeuroNudge", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun AuthSwitchPrompt(
    prompt: String,
    action: String,
    onClick: () -> Unit,
    enabled: Boolean,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(prompt, style = MaterialTheme.typography.bodyMedium)
        TextButton(onClick = onClick, enabled = enabled) { Text(action) }
    }
}

private fun validateEmail(email: String): String? = when {
    email.isBlank() -> "Enter your email."
    !Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches() -> "Enter a valid email address."
    else -> null
}

private fun validatePassword(password: String): String? = when {
    password.isBlank() -> "Enter your password."
    password.length < MinimumPasswordLength -> "Use at least $MinimumPasswordLength characters."
    else -> null
}
