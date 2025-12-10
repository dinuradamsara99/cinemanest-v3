import type { StructureResolver } from 'sanity/structure'

// Custom structure for Sanity Studio
export const structure: StructureResolver = (S) =>
  S.list()
    .title('CinemaNest Content')
    .items([
      // Language section first
      S.listItem()
        .title('Language')
        .icon(() => '🌐')
        .child(
          S.documentTypeList('language')
            .title('All Languages')
        ),

      // Divider
      S.divider(),

      // Movies section
      S.listItem()
        .title('Movies')
        .icon(() => '🎬')
        .child(
          S.list()
            .title('Movies')
            .items([
              // All Movies
              S.listItem()
                .title('All Movies')
                .icon(() => '📽️')
                .child(
                  S.documentTypeList('movie')
                    .title('All Movies')
                ),

              // Trending Movies
              S.listItem()
                .title('Trending Now')
                .icon(() => '🔥')
                .child(
                  S.documentTypeList('movie')
                    .title('Trending Movies')
                    .filter('_type == "movie" && isTrending == true')
                ),

              // Featured Movies
              S.listItem()
                .title('Featured')
                .icon(() => '⭐')
                .child(
                  S.documentTypeList('movie')
                    .title('Featured Movies')
                    .filter('_type == "movie" && isFeatured == true')
                ),
            ])
        ),

      // Divider
      S.divider(),

      // TV Shows section
      S.listItem()
        .title('TV Shows')
        .icon(() => '📺')
        .child(
          S.list()
            .title('TV Shows')
            .items([
              // All TV Shows
              S.listItem()
                .title('All TV Shows')
                .icon(() => '📺')
                .child(
                  S.documentTypeList('tvshow')
                    .title('All TV Shows')
                ),

              // Trending TV Shows
              S.listItem()
                .title('Trending Now')
                .icon(() => '🔥')
                .child(
                  S.documentTypeList('tvshow')
                    .title('Trending TV Shows')
                    .filter('_type == "tvshow" && isTrending == true')
                ),

              // Featured TV Shows
              S.listItem()
                .title('Featured')
                .icon(() => '⭐')
                .child(
                  S.documentTypeList('tvshow')
                    .title('Featured TV Shows')
                    .filter('_type == "tvshow" && isFeatured == true')
                ),
            ])
        ),

      // Divider
      S.divider(),

      // Categories section
      S.listItem()
        .title('Categories')
        .icon(() => '📁')
        .child(
          S.documentTypeList('category')
            .title('All Categories')
        ),
    ])
