/**
 * Represents metadata for a webpage or website, used for SEO and social media sharing.
 */
export interface Metadata {
	/** The name of the website or resource, used as the site name in various meta tags. */
	name: string;

	/** The title of the webpage or website, used in the `<title>` tag and Open Graph. */
	title: string;

	/** A brief description of the webpage or website, used for SEO and social sharing. */
	description: string;

	/** The type of the resource, e.g., 'website', 'article', 'video', etc. Used in Open Graph meta tags. */
	type: string;

	/** The URL of the webpage or website, used in the `<link rel="canonical">` tag and Open Graph. */
	url: string;

	/** The URL of an image representing the webpage or website, used in Open Graph and Twitter meta tags. */
	image: string;
}
