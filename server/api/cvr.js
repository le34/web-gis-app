import { Router } from 'express'
import request from 'request'

const router = Router()

/* GET users listing. */
router.get('/:search', function (req, res, next) {
  request.post('http://LE34_CVR_I_SKYEN:33614fd2-976e-4e1a-af11-acaa0e1ec994@distribution.virk.dk/cvr-permanent/virksomhed/_search', {
    json: {
      _source: [
        'Vrvirksomhed.cvrNummer',
        'Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn'
      ],
      query: {
        query_string: {
          fields: ['Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn', 'Vrvirksomhed.cvrNummer'],
          query: req.params.search
        }
      },
      size: 20
    }
  }, (err, result, body) => {
    console.log(err, result, body)
    res.send(body)
  })
})
export default router
