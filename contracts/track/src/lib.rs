#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, String, Address};

#[contract]
pub struct GitCommitTracker;

#[contractimpl]
impl GitCommitTracker {
    pub fn commit(env: &Env, user: Address, sha: String) {
        // Require authentication from the user
        user.require_auth();
        
        env.storage().persistent().set(&symbol_short!("commit"), &sha);
        env.events().publish((symbol_short!("commit"),), (user, sha.clone()));
    }

    pub fn get_commit(env: &Env) -> Option<String> {
        env.storage().persistent().get(&symbol_short!("commit"))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_commit_and_get() {
        let env = Env::default();
        let contract = GitCommitTracker;
        
        let user = Address::generate(&env);
        let sha = String::from_str(&env, "abc123");
        
        // Mock authentication for testing
        env.mock_all_auths();
        
        contract.commit(&env, user, sha.clone());
        
        let retrieved_sha = contract.get_commit(&env).unwrap();
        assert_eq!(retrieved_sha, sha);
    }
} 