<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import type { Metadata } from '$lib/interfaces/metadata';

	import '@picocss/pico';
	import '@picocss/pico/css/pico.colors.css';

	const metadata: Metadata = {
		name: 'kalja.xyz',
		title: 'Kalja.xyz',
		description:
			'Legendaarinen juomapeli uudessa kuosissa. Helppo pelata, vaikea lopettaa. Bileet alkaa nappia painamalla!',
		type: 'website',
		url: $page.url.href,
		image: `${base}/favicon.png`
	};
</script>

<svelte:head>
	<!-- Essential Meta Tags -->
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="utf-8" />

	<meta name="robots" content="index, follow" />
	<meta
		name="keywords"
		content="juomapeli, juomapelit, drinking game, hitler juomapeli, vesiputous juomapeli"
	/>
	<link rel="canonical" href={metadata.url} />
	<meta name="author" content="NeuronActivation" />
	<meta name="language" content="fi" />

	<!-- Open Graph -->
	<meta property="og:type" content={metadata.type} />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:image" content={metadata.image} />
	<meta property="og:url" content={metadata.url} />
	<meta property="og:site_name" content={metadata.name} />

	<!-- Twitter -->
	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />
	<meta name="twitter:image" content={metadata.image} />
</svelte:head>

<slot />
