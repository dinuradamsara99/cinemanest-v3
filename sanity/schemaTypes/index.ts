import { type SchemaTypeDefinition } from 'sanity'
import { movieType } from './movieType'
import { tvShowType } from './tvShowType'
import { categoryType } from './categoryType'
import { languageType } from './languageType'
import { subtitleTrack } from '../schemas/subtitleTrack'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [movieType, tvShowType, categoryType, languageType, subtitleTrack],
}
