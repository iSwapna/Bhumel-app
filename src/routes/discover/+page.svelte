<script lang="ts">
	// Mock data for LinkedIn-style feed
	const connections = [
		{
			id: 1,
			name: 'Aisha Johnson',
			title: 'Software Engineer at TechCorp',
			profileImage: 'https://i.pravatar.cc/150?img=1',
			mutualConnections: 12
		},
		{
			id: 2,
			name: 'David Chen',
			title: 'Full Stack Developer at StartupXYZ',
			profileImage: 'https://i.pravatar.cc/150?img=2',
			mutualConnections: 8
		},
		{
			id: 3,
			name: 'Sarah Williams',
			title: 'Data Scientist at AI Solutions',
			profileImage: 'https://i.pravatar.cc/150?img=3',
			mutualConnections: 5
		}
	];

	const posts = [
		{
			id: 1,
			author: {
				name: 'Priya Patel',
				title: 'Senior Software Engineer at CodeCraft',
				profileImage: 'https://i.pravatar.cc/150?img=5'
			},
			timeAgo: '2 hours ago',
			content:
				'Just implemented a new algorithm that reduced our API response time by 40%! #programming #optimization',
			likes: 128,
			comments: 24,
			skills: ['algorithms', 'performance optimization', 'backend development']
		},
		{
			id: 2,
			author: {
				name: 'Alex Morgan',
				title: 'Tech Lead at DevSphere',
				profileImage: 'https://i.pravatar.cc/150?img=8'
			},
			timeAgo: '1 day ago',
			content:
				'Our team just open-sourced a new library for graph algorithms. Check it out on GitHub! #opensource #algorithms',
			likes: 236,
			comments: 42,
			skills: ['graph algorithms', 'open source', 'data structures']
		},
		{
			id: 3,
			author: {
				name: 'Jamal Washington',
				title: 'Frontend Developer at UIX Labs',
				profileImage: 'https://i.pravatar.cc/150?img=10'
			},
			timeAgo: '3 days ago',
			content:
				'Just gave a talk at ReactConf about performance optimization in component rendering. Slides in comments!',
			likes: 189,
			comments: 37,
			skills: ['React', 'performance optimization', 'frontend development']
		}
	];

	const jobRecommendations = [
		{
			id: 1,
			title: 'Senior Backend Engineer',
			company: 'InnovateTech',
			location: 'San Francisco, CA (Remote)',
			matchPercentage: 92,
			skills: ['Java', 'Microservices', 'Distributed Systems']
		},
		{
			id: 2,
			title: 'Algorithm Engineer',
			company: 'DataSolutions Inc.',
			location: 'Boston, MA',
			matchPercentage: 87,
			skills: ['Algorithms', 'Machine Learning', 'Python']
		},
		{
			id: 3,
			title: 'Full Stack Developer',
			company: 'WebScale',
			location: 'Remote',
			matchPercentage: 85,
			skills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
		}
	];

	// Define color palette to match the existing app style
	const colors = {
		primary: '#800020', // Maroon
		secondary: '#33001a', // Dark maroon text color
		accent: '#FC6E27', // Orange
		background: '#F8F9FC', // Light gray background
		text: '#33001a', // Dark maroon text
		lightText: '#33001a', // Dark maroon text
		success: '#00A389', // Green
		warning: '#FFB800', // Yellow
		error: '#FF3B6B' // Red
	};
</script>

<svelte:head>
	<title>Discover | Bhumel</title>
</svelte:head>

<div
	class="discover-page"
	style="--primary: {colors.primary}; --secondary: {colors.secondary}; --accent: {colors.accent}; 
     --background: {colors.background}; --text: {colors.text}; --light-text: {colors.lightText};
     --success: {colors.success}; --warning: {colors.warning}; --error: {colors.error};"
>
	<div class="discover-header">
		<h1>Discover</h1>
		<p>Explore opportunities, connections, and content based on your skills</p>
	</div>

	<div class="discover-layout">
		<!-- Left Column - Profile and Stats -->
		<div class="profile-column">
			<div class="profile-card">
				<div class="profile-header">
					<div class="profile-background"></div>
					<div class="profile-picture">
						<img src="https://i.pravatar.cc/150?img=12" alt="Your profile" />
					</div>
				</div>
				<div class="profile-info">
					<h2>Your Name</h2>
					<p class="profile-title">Software Developer</p>
					<div class="profile-stats">
						<div class="stat">
							<span class="stat-count">248</span>
							<span class="stat-label">Connections</span>
						</div>
						<div class="stat">
							<span class="stat-count">42</span>
							<span class="stat-label">Profile views</span>
						</div>
					</div>
				</div>
			</div>

			<div class="skills-card">
				<h3>Your Top Skills</h3>
				<ul class="skills-list">
					<li>
						<div class="skill-name">Algorithms</div>
						<div class="skill-level">Advanced</div>
					</li>
					<li>
						<div class="skill-name">Data Structures</div>
						<div class="skill-level">Intermediate</div>
					</li>
					<li>
						<div class="skill-name">System Design</div>
						<div class="skill-level">Intermediate</div>
					</li>
					<li>
						<div class="skill-name">JavaScript</div>
						<div class="skill-level">Advanced</div>
					</li>
					<li>
						<div class="skill-name">React</div>
						<div class="skill-level">Intermediate</div>
					</li>
				</ul>
				<a href="/dashboard/skill-progression" class="view-all-skills">View skill progression →</a>
			</div>
		</div>

		<!-- Middle Column - Feed -->
		<div class="feed-column">
			<div class="post-composer">
				<div class="composer-input">
					<img src="https://i.pravatar.cc/150?img=12" alt="Your profile" class="mini-profile" />
					<input type="text" placeholder="Share an update about your coding journey..." />
				</div>
				<div class="composer-actions">
					<button class="composer-button">
						<span class="icon">📷</span>
						Photo
					</button>
					<button class="composer-button">
						<span class="icon">📝</span>
						Article
					</button>
					<button class="composer-button">
						<span class="icon">💻</span>
						Code
					</button>
				</div>
			</div>

			{#each posts as post (post.id)}
				<div class="post-card">
					<div class="post-header">
						<img src={post.author.profileImage} alt={post.author.name} class="post-author-image" />
						<div class="post-author-info">
							<h3>{post.author.name}</h3>
							<p>{post.author.title}</p>
							<span class="post-time">{post.timeAgo}</span>
						</div>
					</div>
					<div class="post-content">
						<p>{post.content}</p>
					</div>
					<div class="post-skills">
						{#each post.skills as skill (skill)}
							<span class="skill-tag">{skill}</span>
						{/each}
					</div>
					<div class="post-engagement">
						<div class="engagement-stats">
							<span class="likes">👍 {post.likes}</span>
							<span class="comments">💬 {post.comments} comments</span>
						</div>
						<div class="engagement-actions">
							<button class="engagement-button">
								<span class="icon">👍</span>
								Like
							</button>
							<button class="engagement-button">
								<span class="icon">💬</span>
								Comment
							</button>
							<button class="engagement-button">
								<span class="icon">↗️</span>
								Share
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Right Column - Recommendations -->
		<div class="recommendations-column">
			<div class="recommendations-card">
				<h3>People You May Know</h3>
				<div class="connections-list">
					{#each connections as connection (connection.id)}
						<div class="connection-item">
							<img src={connection.profileImage} alt={connection.name} class="connection-image" />
							<div class="connection-info">
								<h4>{connection.name}</h4>
								<p>{connection.title}</p>
								<span class="mutual-connections"
									>{connection.mutualConnections} mutual connections</span
								>
							</div>
							<button class="connection-button">Connect</button>
						</div>
					{/each}
				</div>
			</div>

			<div class="recommendations-card">
				<h3>Recommended Jobs</h3>
				<div class="jobs-list">
					{#each jobRecommendations as job (job.id)}
						<div class="job-item">
							<div class="job-info">
								<h4>{job.title}</h4>
								<p class="job-company">{job.company}</p>
								<p class="job-location">{job.location}</p>
								<div class="job-match">
									<div class="match-indicator" style="width: {job.matchPercentage}%"></div>
									<span class="match-text">{job.matchPercentage}% match</span>
								</div>
								<div class="job-skills">
									{#each job.skills as skill (skill)}
										<span class="skill-tag small">{skill}</span>
									{/each}
								</div>
							</div>
							<button class="job-button">Apply</button>
						</div>
					{/each}
				</div>
				<a href="/jobs" class="view-all-jobs">See more jobs →</a>
			</div>
		</div>
	</div>
</div>

<style>
	.discover-page {
		font-family: 'Roboto', sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--background);
		color: var(--text);
		font-weight: 500;
	}

	.discover-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.discover-header h1 {
		font-size: 2.75rem;
		font-weight: 900;
		color: var(--text);
		margin-bottom: 0.5rem;
		font-family: 'Roboto Slab', serif;
		letter-spacing: -0.02em;
	}

	.discover-header p {
		font-size: 1.25rem;
		color: var(--text);
		font-weight: 500;
	}

	.discover-layout {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: 1.5rem;
	}

	@media (max-width: 1200px) {
		.discover-layout {
			grid-template-columns: 1fr 2fr;
		}
		.recommendations-column {
			grid-column: span 2;
			grid-row: 2;
		}
	}

	@media (max-width: 768px) {
		.discover-layout {
			grid-template-columns: 1fr;
		}
		.profile-column,
		.feed-column,
		.recommendations-column {
			grid-column: 1;
		}
	}

	/* Card Styles */
	.profile-card,
	.skills-card,
	.post-card,
	.post-composer,
	.recommendations-card {
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		margin-bottom: 1.5rem;
	}

	/* Profile Column Styles */
	.profile-header {
		position: relative;
	}

	.profile-background {
		height: 100px;
		background: linear-gradient(to right, var(--primary), var(--accent));
	}

	.profile-picture {
		position: absolute;
		bottom: -40px;
		left: 50%;
		transform: translateX(-50%);
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 4px solid white;
		overflow: hidden;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.profile-picture img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.profile-info {
		padding: 3rem 1.5rem 1.5rem;
		text-align: center;
	}

	.profile-info h2 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text);
	}

	.profile-title {
		color: var(--light-text);
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.profile-stats {
		display: flex;
		justify-content: space-around;
		border-top: 1px solid #f0f0f0;
		padding-top: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-count {
		font-weight: 700;
		color: var(--primary);
		font-size: 1.1rem;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--light-text);
	}

	.skills-card {
		padding: 1.5rem;
	}

	.skills-card h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2rem;
		color: var(--text);
	}

	.skills-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.skills-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.skills-list li:last-child {
		border-bottom: none;
	}

	.skill-name {
		font-weight: 600;
	}

	.skill-level {
		font-size: 0.85rem;
		color: var(--primary);
		background-color: rgba(128, 0, 32, 0.1);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.view-all-skills {
		display: block;
		text-align: center;
		margin-top: 1rem;
		color: var(--primary);
		text-decoration: none;
		font-weight: 600;
	}

	/* Feed Column Styles */
	.post-composer {
		padding: 1rem;
	}

	.composer-input {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.mini-profile {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.composer-input input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 24px;
		font-size: 0.9rem;
	}

	.composer-actions {
		display: flex;
		justify-content: space-around;
	}

	.composer-button {
		background: none;
		border: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--light-text);
		cursor: pointer;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
	}

	.composer-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.post-card {
		padding: 1.5rem;
	}

	.post-header {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.post-author-image {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.post-author-info h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.post-author-info p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--light-text);
	}

	.post-time {
		font-size: 0.75rem;
		color: var(--light-text);
	}

	.post-content {
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.post-skills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.skill-tag {
		background-color: rgba(128, 0, 32, 0.1);
		color: var(--primary);
		font-size: 0.8rem;
		padding: 0.25rem 0.75rem;
		border-radius: 16px;
		font-weight: 500;
	}

	.skill-tag.small {
		font-size: 0.7rem;
		padding: 0.15rem 0.5rem;
	}

	.post-engagement {
		border-top: 1px solid #f0f0f0;
		padding-top: 1rem;
	}

	.engagement-stats {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		font-size: 0.85rem;
		color: var(--light-text);
	}

	.engagement-actions {
		display: flex;
		justify-content: space-between;
	}

	.engagement-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: none;
		border: none;
		color: var(--light-text);
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.5rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.engagement-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	/* Recommendations Column Styles */
	.recommendations-card {
		padding: 1.5rem;
	}

	.recommendations-card h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2rem;
		color: var(--text);
	}

	.connections-list,
	.jobs-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.connection-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.connection-image {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.connection-info {
		flex: 1;
	}

	.connection-info h4 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.connection-info p {
		margin: 0.25rem 0;
		font-size: 0.8rem;
		color: var(--light-text);
	}

	.mutual-connections {
		font-size: 0.75rem;
		color: var(--light-text);
	}

	.connection-button {
		background-color: white;
		color: var(--primary);
		border: 1px solid var(--primary);
		border-radius: 16px;
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.connection-button:hover {
		background-color: rgba(128, 0, 32, 0.05);
	}

	.job-item {
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 1rem;
	}

	.job-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.job-info h4 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.job-company,
	.job-location {
		margin: 0.25rem 0;
		font-size: 0.85rem;
		color: var(--light-text);
	}

	.job-match {
		margin: 0.75rem 0;
		position: relative;
	}

	.match-indicator {
		height: 6px;
		background-color: var(--success);
		border-radius: 3px;
	}

	.match-text {
		font-size: 0.75rem;
		color: var(--success);
		font-weight: 600;
		margin-top: 0.25rem;
		display: inline-block;
	}

	.job-skills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0.5rem 0;
	}

	.job-button {
		background-color: var(--primary);
		color: white;
		border: none;
		border-radius: 16px;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		display: inline-block;
		margin-top: 0.5rem;
	}

	.job-button:hover {
		background-color: color-mix(in srgb, var(--primary) 90%, black);
	}

	.view-all-jobs {
		display: block;
		text-align: center;
		margin-top: 1rem;
		color: var(--primary);
		text-decoration: none;
		font-weight: 600;
	}
</style>
