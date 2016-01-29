import express from 'express';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';
import fs from 'fs';
import mkpath from 'mkpath';
import merge from 'lodash.merge';

import { createDescendant, record, getAncestors, getDescendantsRecursively } from './../utils/history';
import { get as dbGet, getSafe as dbGetSafe, set as dbSet } from './../utils/database';
import { errorInvalidModel, errorInvalidRoute } from './../utils/errors';
import { validateBlock, validateProject } from './../utils/validation';
import { authenticationMiddleware } from './../utils/authentication';
import { getComponents } from './../utils/getRecursively';

import { createStorageUrl } from './../utils/filePaths';
import {} from './../utils/git';

const router = express.Router(); //eslint-disable-line new-cap
const jsonParser = bodyParser.json({
  strict: false, //allow values other than arrays and objects
});

function paramIsTruthy(param) {
  return (param !== undefined && param !== 'false') || param === true;
}

/***************************
 Login and session validator
 ****************************/

router.use(authenticationMiddleware);

/*********************************
 Cloning
 *********************************/

//todo - right now, supporting on client only
router.get('/clone', (req, res) => {
  res.status(501).send('not implemented');
});

/*********************************
 CRUD
 *********************************/

router.param('projectId', (req, res, next, id) => {

});

router.param('blockId', (req, res, next, id) => {

});

router.route('/:projectId/:blockId/sequence')
  .get((req, res) => {
    const { block } = req;

  })
  .post((req, res) => {
    const { block } = req;

    //update block sequence length just in case

  });

router.route('/:projectId/:blockId')
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {});

router.route('/:projectId')
  .get((req, res) => {
    const { depth } = req.query; //future
  })
  .post((req, res) => {})
  .put((req, res) => {});

///////////////// DEPRECATED //////////////////////

router.get('/project/:id', (req, res) => {
  const { id } = req.params;
  const { tree } = req.query;

  if (paramIsTruthy(tree)) {
    Promise
      .all([
        dbGetSafe(id),
        getComponents(id),
      ])
      .then(([inst, comps]) => {
        res.json({
          instance: inst,
          components: comps,
        });
      })
      .catch(err => res.status(500).send(err.message));
  } else {
    dbGetSafe(id)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  }
});

router.get('/block/:id', (req, res) => {
  const { id } = req.params;
  const { tree } = req.query;

  if (paramIsTruthy(tree)) {
    Promise
      .all([
        dbGetSafe(id),
        getComponents(id),
      ])
      .then(([inst, comps]) => {
        res.json({
          instance: inst,
          components: comps,
        });
      })
      .catch(err => res.status(500).send(err.message));
  } else {
    dbGetSafe(id)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  }
});

router.get('/ancestors/:id', (req, res) => {
  const { id } = req.params;

  getAncestors(id)
    .then(result => res.json(result))
    .catch(err => res.status(500).send(err.message));
});

router.get('/descendants/:id', (req, res) => {
  const { id } = req.params;
  const { depth } = req.query;

  getDescendantsRecursively(id, depth)
    .then(result => res.json(result))
    .catch(err => res.status(500).send(err.message));
});

/*********************************
 POST
 Create an entry for the first time.
 Forces a new ID, to guarantee object is new.

 future - extend scaffold with posted body, then check if valid
 future - allow bypassing of validation?
 *********************************/

router.post('/project', jsonParser, (req, res) => {
  const data = req.body;
  const id = uuid.v4();
  Object.assign(data, {
    id,
  });

  if (validateProject(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).err(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

router.post('/block', jsonParser, (req, res) => {
  const data = req.body;
  const id = uuid.v4();
  Object.assign(data, {
    id,
  });

  if (validateBlock(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).err(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

/*********************************
 PUT
 Modify an existing entry.
 Creates the object if it does not exist. ID of URL is assigned to object.
 *********************************/

router.put('/project/:id', jsonParser, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  Object.assign(data, {
    id,
  });

  //Check that the input is a valid Project
  if (validateProject(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

router.put('/block/:id', jsonParser, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  Object.assign(data, {
    id,
  });

  if (validateBlock(data)) {
    dbSet(id, data)
      .then(result => {
        console.log('result', result);
        return res.json(result);
      })
      .catch(err => res.status(500).send(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

/**
 * Create a child instance
 */
router.post('/clone/:id', (req, res) => {
  const { id } = req.params;

  dbGet(id)
    .then(instance => {
      const clone = createDescendant(instance);
      return dbSet(clone.id, clone)
        .then(() => {
          return record(clone.id, instance.id);
        })
        .then(() => clone);
    })
    .catch(err => {
      res.status(500).send(err.message);
    })
    .then(clone => {
      res.json(clone);
    });
});

//default catch
router.use('*', (req, res) => {
  res.status(404).send(errorInvalidRoute);
});

export default router;
