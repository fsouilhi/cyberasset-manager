const Joi = require('joi');

exports.registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().min(1).required(),
  last_name: Joi.string().min(1).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.assetSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().valid('server','workstation','network','application','database','cloud','iot','other').required(),
  ip_address: Joi.string().allow('', null),
  hostname: Joi.string().allow('', null),
  os: Joi.string().allow('', null),
  owner: Joi.string().allow('', null),
  criticality: Joi.number().integer().min(1).max(4).required(),
  status: Joi.string().valid('active','inactive','maintenance').default('active'),
});

exports.riskSourceSchema = Joi.object({
  name: Joi.string().min(1).required(),
  category: Joi.string().valid('state_actor','organized_crime','hacktivist','malicious_insider','negligent_insider','competitor').required(),
  motivation: Joi.string().allow('', null),
  pertinence: Joi.number().integer().min(1).max(4).required(),
});

exports.strategicScenarioSchema = Joi.object({
  name: Joi.string().min(1).required(),
  risk_source_id: Joi.string().uuid().allow(null),
  feared_event_id: Joi.string().uuid().allow(null),
  likelihood: Joi.number().integer().min(1).max(4).required(),
  severity: Joi.number().integer().min(1).max(4).required(),
  description: Joi.string().allow('', null),
  attack_path: Joi.string().allow('', null),
});

exports.measureSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().valid('preventive','detective','corrective','deterrent').required(),
  treatment_option: Joi.string().valid('reduce','transfer','avoid','accept').required(),
  responsible: Joi.string().allow('', null),
  strategic_scenario_id: Joi.string().uuid().allow(null),
  residual_risk_level: Joi.string().valid('acceptable','tolerable','unacceptable').required(),
  description: Joi.string().allow('', null),
  deadline: Joi.string().allow('', null),
});