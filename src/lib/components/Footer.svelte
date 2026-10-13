<script lang="ts">
import { t } from 'svelte-i18n';
</script>

<footer>
	<p>{$t('drink-responsibly')}</p>
	<a href="https://github.com/NeuronActivation/kalja-xyz" target="_blank" rel="noopener">{
		$t('source-code')
	}</a>
</footer>

<style>
footer {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.25rem 1.5rem;
	padding: 1rem 1rem 1.25rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 249, 238, 0.85);
	text-shadow: 0 1px 2px rgba(60, 25, 0, 0.4);
}

a {
	color: var(--foam);
}
</style>
