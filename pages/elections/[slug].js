import React, { useState } from 'react';
import { LoadingSpinner as Loading } from '../../components/layout';
import VotingOptions from '../../components/elections/voting-options';
import Button from '../../components/user-interface/button';
import { useSession, useElection, useCandidates } from '../../hooks';
import { useRouter } from 'next/router';
import RSA from '../../lib/encryption/rsa';
import Link from 'next/link';
import styles from '../../styles/election.module.css'

export default function Election() {
	const { slug } = useRouter().query;
	const { session, loading: loadingSession } = useSession();
	const { election, loading: loadingElection } = useElection(slug);
	const { candidates, partyLists, loading: loadingCandidates } = useCandidates(slug);
	const [chosenCandidate, setChosenCandidate] = useState(null);
	const [chosenPartyList, setChosenPartyList] = useState(null);
	const password = 'Password123@';
	if (!session) {
		return (
			<p>
				You are currently logged out,
				to cast your vote|register,
				login using the following:&nbsp;
				<Link href="/login">link</Link>
			</p>
		);
	}
	if (loadingSession || loadingElection || loadingCandidates) {
		return <Loading />
	}

	return (
		<div className={styles.container}>
			<h1>{election?.name}</h1>
			<div className={styles.ballots}>
				<div className={styles.ballot}>
					<h2>Individual Representative Candidates</h2>
					<p>
						Here you can select at most 1 candidate,
						who will represent your district in
						the National Assembly.
					</p>
					<span className={styles.options}>
						<VotingOptions
							items={candidates}
							chosen={chosenCandidate}
							setChosen={setChosenCandidate}
						/>
					</span>
				</div>
				<div className={styles.ballot}>
					<h2>Party Lists</h2>
					<p>
						Here you can select at most 1 party,
						to help them collect additional
						seats in the National Assembly.
					</p>
					<span className={styles.options}>
						<VotingOptions
							items={partyLists}
							chosen={chosenPartyList}
							setChosen={setChosenPartyList}
						/>
					</span>
				</div>
			</div>
			<div className={styles.actions}>
				<Button
					title='Vote'
					onClick={() => {

						if (chosenPartyList !== null) {

						}

						const vote = {
							candidateId: chosenCandidate,
							partyListId: chosenPartyList,
						};
						const rsa = new RSA(session.encryptedPrivateKeyPem, password);
						const signature = rsa.sign(JSON.stringify(vote));
						const publicKey = rsa.getPublicKeyPem();
						const body = {
							vote,
							signature,
							publicKey
						}
						console.log(body);
					}}
				/>
			</div>
		</div>
	);
}
