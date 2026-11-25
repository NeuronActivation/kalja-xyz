<script lang="ts">
import { locale } from 'svelte-i18n';
import { isBrowser } from '#lib/constants/isBrowser.ts';
import type { Metadata } from '#lib/interfaces/metadata.ts';

import '@fontsource/shrikhand/latin.css';
import '@fontsource/shrikhand/latin-ext.css';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '../app.css';

// Crawlers need absolute URLs, and the page is prerendered without knowing its real address.
const SITE_URL = 'https://kalja.xyz';

const metadata: Metadata = {
	name: 'kalja.xyz',
	title: 'Kalja.xyz – Juomapeli',
	description:
		'Legendaarinen juomapeli uudessa kuosissa. Helppo pelata, vaikea lopettaa. Bileet alkaa nappia painamalla!',
	type: 'website',
	url: `${SITE_URL}/`,
	image: `${SITE_URL}/icons/icon-512x512.png`,
};

const structuredData = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: metadata.name,
	url: metadata.url,
	description: metadata.description,
	image: metadata.image,
	applicationCategory: 'GameApplication',
	operatingSystem: 'Any',
	inLanguage: ['fi', 'en'],
	isAccessibleForFree: true,
	offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

// The closing tag is split so it doesn't end this component's own <script> block.
const structuredDataTag =
	'<script type="application/ld+json">' + JSON.stringify(structuredData) + '</' + 'script>';

$: if (isBrowser && $locale) document.documentElement.lang = $locale;
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	<meta
		name="keywords"
		content="juomapeli, juomapelit, drinking game, hitler juomapeli, vesiputous juomapeli"
	/>
	<link rel="canonical" href={metadata.url} />
	<meta name="author" content="NeuronActivation" />

	<!-- Open Graph -->
	<meta property="og:type" content={metadata.type} />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:image" content={metadata.image} />
	<meta property="og:image:width" content="512" />
	<meta property="og:image:height" content="512" />
	<meta property="og:image:alt" content="Kalja.xyz logo" />
	<meta property="og:url" content={metadata.url} />
	<meta property="og:site_name" content={metadata.name} />
	<meta property="og:locale" content="fi_FI" />
	<meta property="og:locale:alternate" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />
	<meta name="twitter:image" content={metadata.image} />

	<!-- The data is a constant defined above, not user input. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html structuredDataTag}
</svelte:head>

<slot />
