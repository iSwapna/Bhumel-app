<script lang="ts">
	// Mock data for LinkedIn-style feed
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

	// New mock data for the right panel
	const newProjects = [
		{
			id: 1,
			name: 'Algorithm Visualizer',
			description: 'Interactive tool for visualizing common algorithms',
			category: 'Educational Tools',
			techStack: ['React', 'D3.js', 'TypeScript']
		},
		{
			id: 2,
			name: 'Distributed Cache System',
			description: 'High-performance distributed caching implementation',
			category: 'Backend Infrastructure',
			techStack: ['Go', 'Redis', 'gRPC']
		},
		{
			id: 3,
			name: 'Neural Code Search',
			description: 'AI-powered code search and recommendation engine',
			category: 'Developer Tools',
			techStack: ['Python', 'PyTorch', 'FastAPI']
		}
	];

	const mentors = [
		{
			id: 1,
			name: 'Dr. Maya Rodriguez',
			title: 'Principal Engineer at TechGiant',
			specialties: ['Distributed Systems', 'System Design', 'Backend Architecture'],
			profileImage: 'https://i.pravatar.cc/150?img=20',
			rating: 4.9,
			availability: 'Available next week'
		},
		{
			id: 2,
			name: 'Jason Kim',
			title: 'Staff Engineer at CloudScale',
			specialties: ['Algorithms', 'Data Structures', 'Interview Preparation'],
			profileImage: 'https://i.pravatar.cc/150?img=21',
			rating: 4.8,
			availability: 'Available this weekend'
		},
		{
			id: 3,
			name: 'Aisha Patel',
			title: 'Engineering Manager at StartupX',
			specialties: ['Leadership', 'Career Growth', 'Frontend Development'],
			profileImage: 'https://i.pravatar.cc/150?img=22',
			rating: 4.7,
			availability: 'Limited availability'
		}
	];

	const teammates = [
		{
			id: 1,
			name: 'Carlos Rivera',
			title: 'Backend Developer',
			skills: ['Node.js', 'MongoDB', 'GraphQL'],
			profileImage: 'https://i.pravatar.cc/150?img=30',
			sharedProjects: 3
		},
		{
			id: 2,
			name: 'Emma Wilson',
			title: 'UX Designer',
			skills: ['Figma', 'User Research', 'Prototyping'],
			profileImage: 'https://i.pravatar.cc/150?img=31',
			sharedProjects: 2
		},
		{
			id: 3,
			name: 'Raj Patel',
			title: 'DevOps Engineer',
			skills: ['Kubernetes', 'CI/CD', 'AWS'],
			profileImage: 'https://i.pravatar.cc/150?img=32',
			sharedProjects: 1
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

	// Add goals data
	const goals = [
		{
			id: 1,
			title: 'Master Advanced Algorithms',
			endDate: '2023-12-31',
			progress: 75,
			status: 'On track'
		},
		{
			id: 2,
			title: 'Complete System Design Course',
			endDate: '2023-11-15',
			progress: 60,
			status: 'Needs attention'
		},
		{
			id: 3,
			title: 'Contribute to Open Source',
			endDate: '2023-12-01',
			progress: 40,
			status: 'Behind schedule'
		},
		{
			id: 4,
			title: 'Learn GraphQL',
			endDate: '2023-10-30',
			progress: 90,
			status: 'On track'
		}
	];
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
				<h3>Goals Summary</h3>
				<div class="goals-list">
					{#each goals as goal (goal.id)}
						<div class="goal-item">
							<div class="goal-header">
								<h4 class="goal-title">{goal.title}</h4>
								<div class="goal-date">Due: {new Date(goal.endDate).toLocaleDateString()}</div>
							</div>
							<div class="goal-progress-container">
								<div class="goal-progress-bar">
									<div
										class="goal-progress-fill"
										style="width: {goal.progress}%; background-color: {goal.progress >= 75
											? 'var(--success)'
											: goal.progress >= 50
												? 'var(--warning)'
												: 'var(--error)'}"
									></div>
								</div>
								<div class="goal-progress-stats">
									<span class="goal-progress-percent">{goal.progress}%</span>
									<span
										class="goal-status"
										class:on-track={goal.status === 'On track'}
										class:needs-attention={goal.status === 'Needs attention'}
										class:behind={goal.status === 'Behind schedule'}
									>
										{goal.status}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<a href="/dashboard/skill-progression" class="view-all-link">Manage all goals →</a>
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
				<h3>New Projects</h3>
				<div class="projects-list">
					{#each newProjects as project (project.id)}
						<div class="project-item">
							<div class="project-info">
								<h4>{project.name}</h4>
								<p class="project-description">{project.description}</p>
								<div class="project-category">{project.category}</div>
								<div class="project-stack">
									{#each project.techStack as tech (tech)}
										<span class="skill-tag small">{tech}</span>
									{/each}
								</div>
							</div>
							<button class="project-button">Join</button>
						</div>
					{/each}
				</div>
				<a href="/projects" class="view-all-link">Explore more projects →</a>
			</div>

			<div class="recommendations-card">
				<h3>Mentors</h3>
				<div class="mentors-list">
					{#each mentors as mentor (mentor.id)}
						<div class="mentor-item">
							<img src={mentor.profileImage} alt={mentor.name} class="mentor-image" />
							<div class="mentor-info">
								<h4>{mentor.name}</h4>
								<p class="mentor-title">{mentor.title}</p>
								<div class="mentor-specialties">
									{#each mentor.specialties.slice(0, 2) as specialty (specialty)}
										<span class="skill-tag small">{specialty}</span>
									{/each}
									{#if mentor.specialties.length > 2}
										<span class="more-specialties">+{mentor.specialties.length - 2}</span>
									{/if}
								</div>
								<div class="mentor-availability">
									<span class="availability-indicator"></span>
									{mentor.availability}
								</div>
							</div>
							<div class="mentor-rating">
								<span class="rating-star">★</span>
								<span class="rating-value">{mentor.rating}</span>
							</div>
							<button class="mentor-button">Connect</button>
						</div>
					{/each}
				</div>
				<a href="/mentors" class="view-all-link">Find more mentors →</a>
			</div>

			<div class="recommendations-card">
				<h3>Team Mates</h3>
				<div class="teammates-list">
					{#each teammates as teammate (teammate.id)}
						<div class="teammate-item">
							<img src={teammate.profileImage} alt={teammate.name} class="teammate-image" />
							<div class="teammate-info">
								<h4>{teammate.name}</h4>
								<p class="teammate-title">{teammate.title}</p>
								<div class="teammate-skills">
									{#each teammate.skills.slice(0, 2) as skill (skill)}
										<span class="skill-tag small">{skill}</span>
									{/each}
									{#if teammate.skills.length > 2}
										<span class="more-skills">+{teammate.skills.length - 2}</span>
									{/if}
								</div>
								<div class="shared-projects">
									{teammate.sharedProjects} shared project{teammate.sharedProjects !== 1 ? 's' : ''}
								</div>
							</div>
							<button class="teammate-button">Message</button>
						</div>
					{/each}
				</div>
				<a href="/team" class="view-all-link">See all teammates →</a>
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
		background: var(--primary);
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

	/* Goals Styles */
	.goals-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.goal-item {
		padding: 0.75rem 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.goal-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.goal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.goal-title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
	}

	.goal-date {
		font-size: 0.75rem;
		color: var(--light-text);
		background-color: #f5f5f5;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
	}

	.goal-progress-container {
		margin-top: 0.5rem;
	}

	.goal-progress-bar {
		height: 8px;
		background-color: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.goal-progress-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.goal-progress-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.goal-progress-percent {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text);
	}

	.goal-status {
		font-size: 0.75rem;
		padding: 0.15rem 0.4rem;
		border-radius: 12px;
	}

	.goal-status.on-track {
		background-color: rgba(0, 163, 137, 0.1);
		color: var(--success);
	}

	.goal-status.needs-attention {
		background-color: rgba(255, 184, 0, 0.1);
		color: var(--warning);
	}

	.goal-status.behind {
		background-color: rgba(255, 59, 107, 0.1);
		color: var(--error);
	}

	.view-all-link {
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

	.projects-list,
	.mentors-list,
	.teammates-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Project Item Styles */
	.project-item {
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 1rem;
		display: flex;
		justify-content: space-between;
	}

	.project-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.project-info {
		flex: 1;
	}

	.project-info h4 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.project-description {
		margin: 0.25rem 0;
		font-size: 0.85rem;
		color: var(--light-text);
	}

	.project-category {
		display: inline-block;
		background-color: rgba(252, 110, 39, 0.1);
		color: var(--accent);
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		margin: 0.25rem 0;
	}

	.project-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.project-button {
		background-color: var(--primary);
		color: white;
		border: none;
		border-radius: 16px;
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		align-self: flex-start;
		margin-left: 1rem;
	}

	.project-button:hover {
		background-color: color-mix(in srgb, var(--primary) 90%, black);
	}

	/* Mentor Item Styles */
	.mentor-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 1rem;
	}

	.mentor-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.mentor-image {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.mentor-info {
		flex: 1;
	}

	.mentor-info h4 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.mentor-title {
		margin: 0.25rem 0;
		font-size: 0.8rem;
		color: var(--light-text);
	}

	.mentor-specialties {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0.25rem 0;
	}

	.more-specialties,
	.more-skills {
		font-size: 0.7rem;
		color: var(--light-text);
		background-color: #f5f5f5;
		padding: 0.15rem 0.4rem;
		border-radius: 12px;
	}

	.mentor-availability {
		font-size: 0.7rem;
		color: var(--light-text);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.25rem;
	}

	.availability-indicator {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--success);
	}

	.mentor-rating {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--warning);
	}

	.rating-star {
		color: var(--warning);
	}

	.mentor-button {
		background-color: white;
		color: var(--primary);
		border: 1px solid var(--primary);
		border-radius: 16px;
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.mentor-button:hover {
		background-color: rgba(128, 0, 32, 0.05);
	}

	/* Teammate Item Styles */
	.teammate-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 1rem;
	}

	.teammate-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.teammate-image {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.teammate-info {
		flex: 1;
	}

	.teammate-info h4 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.teammate-title {
		margin: 0.25rem 0;
		font-size: 0.8rem;
		color: var(--light-text);
	}

	.teammate-skills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0.25rem 0;
	}

	.shared-projects {
		font-size: 0.7rem;
		color: var(--light-text);
		margin-top: 0.25rem;
	}

	.teammate-button {
		background-color: white;
		color: var(--primary);
		border: 1px solid var(--primary);
		border-radius: 16px;
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.teammate-button:hover {
		background-color: rgba(128, 0, 32, 0.05);
	}
</style>
