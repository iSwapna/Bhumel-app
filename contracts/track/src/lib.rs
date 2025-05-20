#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, vec, Env, Vec, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GitCommit {
    pub sha: String,
    pub user: String,
    pub timestamp: u64,
}

#[contract]
pub struct GitCommitTracker;

#[contractimpl]
impl GitCommitTracker {
    pub fn record_commit(env: &Env, sha: String, user: String) -> GitCommit {
        let commit = GitCommit {
            sha: sha.clone(),
            user: user.clone(),
            timestamp: env.ledger().timestamp(),
        };
        
        // Emit event for the commit
        env.events().publish((symbol_short!("commit"), symbol_short!("recorded")), commit.clone());
        
        commit
    }

    pub fn get_commits(env: &Env) -> Vec<GitCommit> {
        // In a real implementation, this would query the contract's storage
        // For now, we'll return an empty vector
        vec![env]
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_record_commit() {
        let env = Env::default();
        let contract = GitCommitTracker;
        
        let commit = contract.record_commit(
            &env,
            String::from_str(&env, "abc123"),
            String::from_str(&env, "alice"),
        );

        assert_eq!(commit.user, String::from_str(&env, "alice"));
        assert_eq!(commit.sha, String::from_str(&env, "abc123"));
    }
} 