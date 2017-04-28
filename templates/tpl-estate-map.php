<?php
/**
 * The template for displaying all single posts and attachments
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */

get_header(); ?>
<div class="wrap">
	<div id="mnj-map-page" class="content-area">
		<main id="main" class="site-main" role="main mnj-map">
		<?php
		// Start the loop.
		while ( have_posts() ) : the_post();

			the_title('<h1 class="entry-title">' , '</h1>');
			
			the_content();

			
		
		endwhile;
		?>

		</main><!-- .site-main -->
	</div><!-- .content-area -->
</div>
<?php get_footer(); ?>
