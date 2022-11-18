import React, { useRef, useState } from 'react';
import { LoadingSpinner as Spinner } from '../../components/layout';
import { Button, Input, Modal } from '../../components/user-interface';
import { Ballot } from '../../components/elections';
import {
	useSession,
	useElection,
	useCandidates,
	useRegistration,
	useNotification,
	useVoting
} from '../../hooks';
import { useRouter } from 'next/router';
import { RSA } from '../../lib/encryption';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { Key } from '../../components/icons';
import md5 from 'md5';
import styles from '../../styles/election.module.css'

const DESCRIPTIONS = {
	0: `Here you can select at most 1 candidate,
	who will represent your district
	in the National Assembly.`,
	1: `Here you can select at most 1 party,
	to help them collect additional
	seats in the National Assembly.`
};


const Election = () => {
	const { slug } = useRouter().query;
	const postalcode = getCookie('auth.postal-code');
	const [chosenCandidate, setChosenCandidate] = useState(null);
	const [chosenPartyList, setChosenPartyList] = useState(null);
	const { election, loading: loadingElection } = useElection(slug);
	const { session, loading: loadingSession } = useSession();
	const { setNotification } = useNotification();
	const { candidates, partyLists, districtId, loading: loadingCandidates } =
			useCandidates({electionid: election?._id, postalcode});
	const passwordRef = useRef();
	const [rsaKeyPair, setRsaKeyPair] = useState(null);
	const { registration, getRegistration, register } = useRegistration();
	const { vote, getVote, cast } = useVoting();
	const redirectHandler = () => {

	};
	const passwordHandler = async () => {
		let keys; let password = passwordRef.current.value;
		passwordRef.current.value = '';
		try {
			keys = new RSA(session.user.encryptedPrivateKeyPem.trim(), password);
		} catch (error) {
			setNotification(
				'error',
				'Error',
				'The provided password was invalid!'
			);
			return;
		}
		setNotification(
			'success',
			'Success',
			'Now, you can vote for your candidates!'
		);
		setRsaKeyPair(keys);
		const publickeyhash = md5(keys.getPublicKeyPem());
		await getRegistration({electionid: election._id, publickeyhash});
		await getVote({electionid: election._id, publickeyhash});
	};
	if (!loadingSession && !session) {
		return (
			<p>
				You are currently logged out,
				to cast your vote|register,
				login using the following:&nbsp;
				<Link href="/login">link</Link>
			</p>
		);
	}
	const loading = loadingCandidates || loadingElection || loadingSession;
	if (loading) return <Spinner />;
	if (!rsaKeyPair) {
		return (
			<>
				<Modal image='/images/auth.svg' alt='auth' onCloseClicked={redirectHandler}>
					<h1>Please enter your password:</h1>
					<Input
						Icon={Key}
						type='password'
						ref={passwordRef}
					/>
					<Button
						onClick={passwordHandler}
						title="Submit"
					/>
				</Modal>
			</>
		);
	}
	if (rsaKeyPair && !registration) {
		return (
			<Button
				title='Register'
				onClick={async () => {
					await register({
						electionid: election._id,
						publickey: rsaKeyPair.getPublicKeyPem()
					});
				}}
			/>
		)
	}
	if (rsaKeyPair && !vote) {
		return (
			<div className={styles.container}>
				<h1>{election.name}</h1>
				<div className={styles.ballots}>
					<Ballot
						title="Individual Representative Candidates"
						description={DESCRIPTIONS[0]}
						items={candidates}
						chosen={chosenCandidate}
						choose={setChosenCandidate}
					/>
					<Ballot
						title="Party Lists"
						description={DESCRIPTIONS[1]}
						items={partyLists}
						chosen={chosenPartyList}
						choose={setChosenPartyList}
					/>
				</div>
				<div className={styles.actions}>
					<Button
						title='Vote'
						onClick={async () => {
							const vote = {
								districtId,
								candidateId: chosenCandidate,
								partyListId: chosenPartyList,
							};
							const signature = rsaKeyPair.sign(JSON.stringify(vote));
							const publicKey = rsaKeyPair.getPublicKeyPem();
							const body = {
								vote,
								signature,
								publicKey
							}
							await cast({
								electionid: election?._id,
								body
							});
						}}
					/>
				</div>
			</div>
		);
	}
	return (
		<div>
			<p>
				You have already voted on this election.
				Click on the <Link href="/elections">link</Link> to
				get redirected to the elections.
			</p>
		</div>
	)
}

export default Election;
