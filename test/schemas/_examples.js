import uuid from 'node-uuid';

//todo - these should be generators so IDs change

/*
 * Note that there are scaffolding functions available on each schema.
 * These models are intentionally to note when changes to the schema occurs - see rest of /test/schemas
 */

export const Block = {
  id: uuid.v4(),
  parents: [],
  metadata: {
    authors: [],
    version: '0.0.0',
    tags: {},
  },
  sequence: {
    annotations: [],
  },
  source: {},
  options: [],
  components: [],
  rules: {},
  notes: {},
};

export const Project = {
  id: uuid.v4(),
  parents: [],
  metadata: {
    authors: [],
    version: '0.0.0',
    tags: {},
  },
  components: [],
  settings: {},
};

export const Annotation = {
  id: uuid.v4(),
  description: 'example annotation',
  tags: {},
  optimizability: 'none',
  sequence: 'acgtagc',
};
