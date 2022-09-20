import {useContext, useRef, useState} from 'react';
import NotificationContext from '../store/notification-context';
import { useRouter } from 'next/router';
import { getSession } from '../lib/auth/server';
import Input from '../components/user-interface/input';
import Secret from '../components/icons/secret';
import Button from '../components/user-interface/button';
import RSA from '../lib/encryption/rsa';
import md5 from 'md5';
import styles from '../styles/register.module.css';
import LoadingSpinner from '../components/layout/loading-spinner';
import FirstStepForm from '../components/register/first-step-form';
import SecondStepForm from '../components/register/second-step-form';
import ThirdStepForm from '../components/register/third-step-form';
import Form from '../components/user-interface/form';
import Steps from '../components/register/steps';
import Navigate from '../components/register/navigate';
import Link from 'next/link';

export default function Register() {
	const router = useRouter();
	const notificationCtx = useContext(NotificationContext);
	const firstNameRef = useRef();
	const lastNameRef = useRef();
	const emailRef = useRef();
	const identityNumberRef = useRef();
	const passwordRef = useRef();
	const confirmPasswordRef = useRef();
	const postalCodeRef = useRef();
	const registrationCodeRef = useRef();
	const [step, setStep] = useState(0);
	const validateForm = () => {
		
		switch (step) {
		case 0:
			if (!(/[A-ZÁÉ][a-záé]{2,}/).test(firstNameRef.current.value)) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided first name is invalid!'
				);
				return false;
			}
			
			if (!(/[A-ZÁÉ][a-záé]{2,}/).test(lastNameRef.current.value)) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided last name is invalid!'
				);
				return false;
			}

			if (!(/^[0-9]{6}[A-Z]{2}$/).test(identityNumberRef.current.value)) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided identity number is invalid!'
				);
				return false;
			}
			
			return true;
		case 1:
			if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
				.test(emailRef.current.value)) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided e-mail address is invalid!'
				);
				return false;
			}

			if (!(/^[0-9]{4}$/).test(postalCodeRef.current.value)) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided postal code is invalid!'
				);
				return false;
			}
			return true;
		case 2:
			if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
				.test(passwordRef.current.value)) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided password is invalid!'
				);
				return false;
			}

			if (passwordRef.current.value !== confirmPasswordRef.current.value) {
				notificationCtx.set(
					'error',
					'Error',
					'The provided passwords did not match!'
				);
				return false;
			}
			return true;
		case 3:
			if (registrationCodeRef.current.value.trim() === '') {
				notificationCtx.set(
					'error',
					'Error',
					'The provided registration code was invalid!'
				);
				return false;
			}
			return true;
		default:
			return false;
		}
	};
	const submitHandler = async (event) => {
		event.preventDefault();

		if (!validateForm()) return;

		const password = passwordRef.current.value;
		const email = emailRef.current.value;
		const identityNumber = identityNumberRef.current.value;
		const firstName = firstNameRef.current.value;
		const lastName = lastNameRef.current.value;
		const registrationCode = registrationCodeRef.current.value;
		const postalCode = postalCodeRef.current.value;

		const keys = new RSA();
		const encryptedPrivateKeyPem = keys.getPrivateKeyPem(password);
		const encryptedIdentityNumber = keys.encrypt(identityNumber);
		const encryptedEmail = keys.encrypt(email);
		const encryptedFirstName = keys.encrypt(firstName);
		const encryptedLastName = keys.encrypt(lastName);
		const passwordHash = md5(password);
		const registrationCodeHash = md5(registrationCode);

		notificationCtx.set(
			'pending',
			'Pending',
			'Your registration request have been sent!'
		);

		passwordRef.current.value = '';
		confirmPasswordRef.current.value = '';
		registrationCodeRef.current.value = '';

		const headers = {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};
		const body = JSON.stringify({
			identityNumber,
			encryptedIdentityNumber,
			email,
			encryptedEmail,
			encryptedFirstName,
			encryptedLastName,
			encryptedPrivateKeyPem,
			passwordHash,
			registrationCodeHash,
			postalCode
		});
		const response = await fetch('/api/v1/auth/register', {
			method: 'POST',
			headers: headers,
			body: body
		});
		const message = await response.text();
		if (response.status === 409) {
			notificationCtx.set(
				'error',
				'Error',
				message
			);
			await router.replace('/login');
			return;
		}

		if (!response.ok) {
			notificationCtx.set(
				'error', 
				'Error',
				message
			);
			setStep(2);
			return;
		}
		notificationCtx.set(
			'success', 
			'Success',
			message
		);
		await router.replace('/login');
	};
	const backHandler = () => setStep(step-1);
	const forwardHandler = () => {
		if (validateForm()) {
			setStep(step+1)
		}
	};
	return (
		<Form>
			<h1>Registration</h1>
			<Steps currentStep={step} numberOfSteps={4} />
			<div style={{display: (step !== 0) ? 'none' : 'block'}}>
				<FirstStepForm
					firstNameRef={firstNameRef}
					lastNameRef={lastNameRef}
					identityNumberRef={identityNumberRef}
				/>
			</div>
			<div style={{display: (step !== 1) ? 'none' : 'block'}}>
				<SecondStepForm
					emailRef={emailRef}
					postalCodeRef={postalCodeRef}
				/>
			</div>
			<div style={{display: (step !== 2) ? 'none' : 'block'}}>
				<ThirdStepForm
					passwordRef={passwordRef}
					confirmPasswordRef={confirmPasswordRef}
				/>
				<Helper />
			</div>
			<div style={{display: (step !== 3) ? 'none' : 'block'}}>
				<Input
					id='registrationCode'
					label='Registration code'
					innerRef={registrationCodeRef}
					type='password'
					icon={<Secret />}
					placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
				/>
			</div>
			<Navigate
				forwardHandler={forwardHandler}
				backHandler={backHandler}
				submitHandler={submitHandler}
				step={step}
				max={3}
			/>
			<Question />
		</Form>
	)
}

function Helper() {
	return (
		<div className={styles.helper}>
			<ul>
				<li>Must be at least 8 characters long</li>
				<li>Must contain small and capital letters [A-z]</li>
				<li>Must contain numbers [0-9]</li>
				<li>Must contain special characters [@^+!]</li>
			</ul>
		</div>
	);
}


function Question() {
	return (
		<span>
      Do you already have an account? Login &nbsp;
			<Link href='/login'>
        here.
			</Link>
		</span>
	);
}

export async function getServerSideProps(context) {
	const { req, res } = context;
	const session = await getSession({ req, res });
	if (!session) return { props: {} };
	return { redirect: { destination: '/', permanent: false } };
}
