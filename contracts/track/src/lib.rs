#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, String, Address, Error, Map, contracttype};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Certificate {
    pub hash: String,
    pub id: String,
}

#[repr(u32)]
pub enum CertifyError {
    CertificateNotFound = 1,
}

impl From<CertifyError> for Error {
    fn from(e: CertifyError) -> Self {
        Error::from_contract_error(e as u32)
    }
}

#[contract]
pub struct Certify;

#[contractimpl]
impl Certify {
    pub fn __constructor(
        env: Env,
        admin: Address,
    ) -> Result<(), Error> {
        admin.require_auth();
        env.events().publish((symbol_short!("crumb"),), admin);
        Ok(())
    }

    pub fn certify(env: &Env, user: Address, id: String, hash: String, timestamp: u64) -> Result<(), Error> {
        // Require authentication from the user
        user.require_auth();
        
        // Get the existing map or create a new one
        let key = symbol_short!("certs");
        let mut certifications: Map<u64, Certificate> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        
        // Create the new certificate
        let certificate = Certificate {
            hash: hash.clone(),
            id: id.clone(),
        };
        
        // Add the new certification
        certifications.set(timestamp, certificate);
        
        // Keep only the last 20 entries by removing oldest if we exceed 20
        if certifications.len() > 20 {
            // Find the oldest timestamp and remove it
            let mut oldest_timestamp: Option<u64> = None;
            for (ts, _) in certifications.iter() {
                if oldest_timestamp.is_none() || ts < oldest_timestamp.unwrap() {
                    oldest_timestamp = Some(ts);
                }
            }
            
            // Remove the oldest entry
            if let Some(oldest_timestamp) = oldest_timestamp {
                certifications.remove(oldest_timestamp);
            }
        }
        
        // Store the updated map
        env.storage().persistent().set(&key, &certifications);
        
        // Emit event
        env.events().publish((symbol_short!("certify"),), (user, hash, id, timestamp));
        
        Ok(())
    }

    pub fn verify(env: &Env, timestamp: u64) -> Result<Certificate, Error> {
        let key = symbol_short!("certs");
        let certifications: Map<u64, Certificate> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        
        // Look up the timestamp in the map
        match certifications.get(timestamp) {
            Some(cert) => Ok(cert),
            None => Err(CertifyError::CertificateNotFound.into()),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_certify_and_verify() {
        let env = Env::default();
        let contract = Certify;
        
        let user = Address::generate(&env);
        let hash = String::from_str(&env, "abc123");
        let id = String::from_str(&env, "cert001");
        let timestamp = 1234567890;
        
        // Mock authentication for testing
        env.mock_all_auths();
        
        // Test certification
        contract.certify(&env, user, id.clone(), hash.clone(), timestamp).unwrap();
        
        // Test verification
        let verified_cert = contract.verify(&env, timestamp);
        assert_eq!(verified_cert.hash, hash);
        assert_eq!(verified_cert.id, id);
        
        // Test verification with wrong timestamp
        let wrong_timestamp = 9876543210;
        let empty_cert = contract.verify(&env, wrong_timestamp);
        assert_eq!(empty_cert.hash, String::from_str(&env, ""));
        assert_eq!(empty_cert.id, String::from_str(&env, ""));
    }
} 