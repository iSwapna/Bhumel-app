interface SkillProgress {
	skill: string;
	level: 'beginner' | 'intermediate' | 'advanced';
	confidence: number;
	evidence: string[];
}

interface CommitAnalysis {
	skills: SkillProgress[];
	context: {
		framework: string;
		language: string;
		patterns: string[];
	};
	recommendations: string[];
}

// Map of file extensions to languages
const LANGUAGE_MAP: Record<string, string> = {
	'.js': 'JavaScript',
	'.ts': 'TypeScript',
	'.jsx': 'JavaScript (React)',
	'.tsx': 'TypeScript (React)',
	'.svelte': 'Svelte',
	'.vue': 'Vue.js',
	'.css': 'CSS',
	'.scss': 'SCSS',
	'.html': 'HTML',
	'.json': 'JSON',
	'.md': 'Markdown',
	'.py': 'Python',
	'.go': 'Go',
	'.java': 'Java',
	'.rb': 'Ruby',
	'.php': 'PHP',
	'.rs': 'Rust',
	'.sh': 'Shell',
	'.c': 'C',
	'.cpp': 'C++',
	'.cs': 'C#'
};

// Map of patterns to skills
const SKILL_PATTERNS: Array<{
	pattern: RegExp;
	skill: string;
	level: 'beginner' | 'intermediate' | 'advanced';
}> = [
	// JavaScript/TypeScript patterns
	{ pattern: /function\s*\(/i, skill: 'Function Definition', level: 'beginner' },
	{ pattern: /=>\s*{/i, skill: 'Arrow Functions', level: 'beginner' },
	{ pattern: /interface\s+\w+/i, skill: 'TypeScript Interfaces', level: 'intermediate' },
	{ pattern: /type\s+\w+\s*=/i, skill: 'TypeScript Type Aliases', level: 'intermediate' },
	{ pattern: /async\s+function|async\s+\(/i, skill: 'Async/Await', level: 'intermediate' },
	{ pattern: /new\s+Promise/i, skill: 'Promises', level: 'intermediate' },
	{ pattern: /import\s+{[^}]*}\s+from/i, skill: 'ES Modules', level: 'beginner' },
	{
		pattern: /export\s+(default\s+)?(class|function|const|let|var)/i,
		skill: 'ES Modules',
		level: 'beginner'
	},
	{ pattern: /class\s+\w+(\s+extends\s+\w+)?/i, skill: 'Classes', level: 'intermediate' },
	{ pattern: /\[\.\.\.\w+\]/i, skill: 'Spread Operator', level: 'intermediate' },
	{ pattern: /const\s*{[^}]*}\s*=\s*\w+/i, skill: 'Destructuring', level: 'intermediate' },
	{ pattern: /\btry\s*{[\s\S]*}\s*catch\s*\(/i, skill: 'Error Handling', level: 'beginner' },
	{ pattern: /map\s*\(\s*(\w+|\([^)]*\))\s*=>/i, skill: 'Array Methods', level: 'intermediate' },
	{ pattern: /filter\s*\(\s*(\w+|\([^)]*\))\s*=>/i, skill: 'Array Methods', level: 'intermediate' },
	{ pattern: /reduce\s*\(\s*(\w+|\([^)]*\))\s*=>/i, skill: 'Array Methods', level: 'advanced' },

	// React patterns
	{ pattern: /<[A-Z]\w+(\s+\w+="[^"]*")*\s*>/i, skill: 'React Components', level: 'intermediate' },
	{ pattern: /useState\s*\(/i, skill: 'React Hooks', level: 'intermediate' },
	{ pattern: /useEffect\s*\(\s*\(\)\s*=>/i, skill: 'React Hooks', level: 'intermediate' },
	{ pattern: /useContext\s*\(/i, skill: 'React Context', level: 'advanced' },

	// API/Backend patterns
	{ pattern: /fetch\s*\(/i, skill: 'API Calls', level: 'intermediate' },
	{ pattern: /axios\s*\./i, skill: 'API Calls', level: 'intermediate' },
	{ pattern: /\bGET\b|\bPOST\b|\bPUT\b|\bDELETE\b/i, skill: 'REST API', level: 'intermediate' },
	{ pattern: /new\s+Response\s*\(/i, skill: 'Web API', level: 'intermediate' },

	// Testing patterns
	{ pattern: /describe\s*\(\s*['"][^'"]*['"]\s*,/i, skill: 'Testing', level: 'intermediate' },
	{ pattern: /it\s*\(\s*['"][^'"]*['"]\s*,/i, skill: 'Testing', level: 'intermediate' },
	{ pattern: /expect\s*\(/i, skill: 'Testing Assertions', level: 'intermediate' },
	{ pattern: /mock\s*\(/i, skill: 'Mocking', level: 'advanced' },

	// Database patterns
	{ pattern: /\bSELECT\b.*\bFROM\b/i, skill: 'SQL', level: 'intermediate' },
	{ pattern: /\bINSERT\b.*\bINTO\b/i, skill: 'SQL', level: 'intermediate' },
	{ pattern: /\bUPDATE\b.*\bSET\b/i, skill: 'SQL', level: 'intermediate' },
	{ pattern: /\bDELETE\b.*\bFROM\b/i, skill: 'SQL', level: 'intermediate' },

	// Security patterns
	{ pattern: /authentication|authorization/i, skill: 'Security', level: 'intermediate' },
	{ pattern: /password|encrypt|hash/i, skill: 'Security', level: 'intermediate' },
	{ pattern: /token|jwt|session/i, skill: 'Authentication', level: 'intermediate' },

	// Architecture patterns
	{ pattern: /service/i, skill: 'Service-oriented Architecture', level: 'intermediate' },
	{ pattern: /controller/i, skill: 'MVC Pattern', level: 'intermediate' },
	{ pattern: /middleware/i, skill: 'Middleware Pattern', level: 'intermediate' },
	{ pattern: /singleton/i, skill: 'Singleton Pattern', level: 'intermediate' },
	{ pattern: /factory/i, skill: 'Factory Pattern', level: 'advanced' }
];

// Map of frameworks by file patterns
const FRAMEWORK_PATTERNS: Array<{ pattern: RegExp; framework: string }> = [
	{ pattern: /react/i, framework: 'React' },
	{ pattern: /next/i, framework: 'Next.js' },
	{ pattern: /vue/i, framework: 'Vue.js' },
	{ pattern: /angular/i, framework: 'Angular' },
	{ pattern: /svelte/i, framework: 'Svelte' },
	{ pattern: /express/i, framework: 'Express.js' },
	{ pattern: /koa/i, framework: 'Koa.js' },
	{ pattern: /fastify/i, framework: 'Fastify' },
	{ pattern: /nest/i, framework: 'NestJS' },
	{ pattern: /django/i, framework: 'Django' },
	{ pattern: /flask/i, framework: 'Flask' },
	{ pattern: /laravel/i, framework: 'Laravel' },
	{ pattern: /spring/i, framework: 'Spring' },
	{ pattern: /rails/i, framework: 'Ruby on Rails' }
];

// Code pattern identifiers
const CODE_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
	{ pattern: /\/\/\s*TODO/i, name: 'TODOs in code' },
	{ pattern: /console\.log/i, name: 'Console logging' },
	{ pattern: /[^\w\s]\s*=\s*require\(/i, name: 'CommonJS imports' },
	{ pattern: /if\s*\([^)]*\)\s*{\s*return/i, name: 'Early returns' },
	{ pattern: /catch\s*\([^)]*\)\s*{\s*console/i, name: 'Console error logging' },
	{ pattern: /catch\s*\([^)]*\)\s*{\s*return/i, name: 'Error swallowing' },
	{ pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>/i, name: 'Const function declarations' },
	{ pattern: /await\s+Promise\.all\(/i, name: 'Parallel async operations' },
	{ pattern: /\?\.|\?\?/i, name: 'Optional chaining/nullish coalescing' }
];

// Simple in-memory cache
const analysisCache = new Map<string, CommitAnalysis>();

export class SimpleAnalysisService {
	async analyzeCommit(
		commitHash: string,
		commitMessage: string,
		files: { path: string; changes: string }[]
	): Promise<CommitAnalysis> {
		// Use commit hash as cache key
		const cacheKey = commitHash;

		// Check cache first
		const cachedAnalysis = analysisCache.get(cacheKey);
		if (cachedAnalysis) {
			console.log('Using cached simple analysis for commit:', commitHash);
			return cachedAnalysis;
		}

		// Detect languages
		const languages = new Set<string>();
		const frameworks = new Set<string>();
		const patterns = new Set<string>();
		const skills: Record<string, SkillProgress> = {};

		// Process each file
		for (const file of files) {
			// Determine language from file extension
			const extension = file.path.match(/\.\w+$/)?.[0] || '';
			const language = LANGUAGE_MAP[extension] || 'Unknown';
			if (language !== 'Unknown') {
				languages.add(language);
			}

			// Look for frameworks
			for (const { pattern, framework } of FRAMEWORK_PATTERNS) {
				if (pattern.test(file.path) || pattern.test(file.changes)) {
					frameworks.add(framework);
				}
			}

			// Look for code patterns
			for (const { pattern, name } of CODE_PATTERNS) {
				if (pattern.test(file.changes)) {
					patterns.add(name);
				}
			}

			// Look for skills
			for (const { pattern, skill, level } of SKILL_PATTERNS) {
				if (pattern.test(file.changes)) {
					// If skill already exists, keep the highest level
					if (skills[skill]) {
						const currentLevel = skills[skill].level;
						if (
							(currentLevel === 'beginner' && (level === 'intermediate' || level === 'advanced')) ||
							(currentLevel === 'intermediate' && level === 'advanced')
						) {
							skills[skill].level = level;
						}
						// Add the file as evidence if not already included
						if (!skills[skill].evidence.includes(file.path)) {
							skills[skill].evidence.push(file.path);
						}
					} else {
						// Create new skill
						skills[skill] = {
							skill,
							level,
							confidence: 0.8, // Static confidence value
							evidence: [file.path]
						};
					}
				}
			}
		}

		// Generate recommendations based on patterns found
		const recommendations: string[] = [];

		if (patterns.has('TODOs in code')) {
			recommendations.push('Consider addressing TODO comments before finalizing the code');
		}

		if (patterns.has('Console logging')) {
			recommendations.push('Remove or replace console.log statements with proper logging');
		}

		if (patterns.has('Error swallowing')) {
			recommendations.push('Avoid swallowing errors without proper handling');
		}

		// Add a general recommendation based on skill level
		const skillsArray = Object.values(skills);
		const hasAdvancedSkills = skillsArray.some((skill) => skill.level === 'advanced');
		const hasIntermediateSkills = skillsArray.some((skill) => skill.level === 'intermediate');

		if (hasAdvancedSkills) {
			recommendations.push(
				'The code demonstrates advanced patterns. Consider adding comprehensive documentation.'
			);
		} else if (hasIntermediateSkills) {
			recommendations.push('Consider adding more automated tests to verify the functionality.');
		} else {
			recommendations.push('Consider adopting more structured coding patterns and organization.');
		}

		// Prepare the analysis result
		const analysis: CommitAnalysis = {
			skills: Object.values(skills),
			context: {
				framework: Array.from(frameworks).join(', ') || 'Unknown',
				language: Array.from(languages).join(', ') || 'Unknown',
				patterns: Array.from(patterns)
			},
			recommendations
		};

		// Cache the result
		analysisCache.set(cacheKey, analysis);
		console.log('Cached simple analysis for commit:', commitHash);

		return analysis;
	}
}
