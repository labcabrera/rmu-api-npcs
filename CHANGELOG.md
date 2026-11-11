# [0.2.0](https://github.com/labcabrera/rmu-api-npcs/compare/0.1.3...0.2.0) (2026-11-11)


* feat!: move to the core template with the creature stat block ([a84bd61](https://github.com/labcabrera/rmu-api-npcs/commit/a84bd61f7abe701900495b0ff76fbe35147b14b1))
* feat!: npcs take the access rules of their realm ([03cb658](https://github.com/labcabrera/rmu-api-npcs/commit/03cb658c09bac6803a4a02f3e173e0d72f49a5fb))


### Features

* accept water biomes and poisons without type or modifier ([8ff59b3](https://github.com/labcabrera/rmu-api-npcs/commit/8ff59b39d392c998f5aa06a22fb56fd4c12d9ea6))
* creating an npc needs the user to read its realm (spec 071) ([78ee8d0](https://github.com/labcabrera/rmu-api-npcs/commit/78ee8d05deec1dd8cf25bcc2593a816be4e809cd))
* encounter tables and stateless encounter resolution ([f32a5ad](https://github.com/labcabrera/rmu-api-npcs/commit/f32a5adfb124c67dc0b6bb6285f0e45657882687))
* global npcs without realm, admin only (spec 073) ([74601e9](https://github.com/labcabrera/rmu-api-npcs/commit/74601e9686c241a070a04276ea9219921f03ad38))
* npc attack with no attack table ([997f7ea](https://github.com/labcabrera/rmu-api-npcs/commit/997f7ea4520d25a5b3adf5ec0b4d0e0099a54d2f))
* npc shield with type, db, ranks and bonus ([0e05346](https://github.com/labcabrera/rmu-api-npcs/commit/0e05346a4502b2f7bc5ac3a99e1cbbb58d29c8a8))
* **npcs:** derive catalog trait id of sense talents ([2327d91](https://github.com/labcabrera/rmu-api-npcs/commit/2327d9157a5aa733e8b94ee4d3465f11d1728519))
* **npcs:** optional fright level on the NPC stat block ([2cc0db6](https://github.com/labcabrera/rmu-api-npcs/commit/2cc0db680dc5caa13d95209db4a814e2bd7763ea))


### BREAKING CHANGES

* the owner of an NPC no longer grants any permission and private NPCs are
visible to whoever reads their realm; lists filter by readable realms instead of public OR
owner; creating in a realm read only is a 403 realm-not-writable; NpcDto gains access.
* new model and endpoints; the skills/attacks subresources were removed and the
service reads the common env names (RMU_IAM_*, RMU_KAFKA_*, RMU_API_CORE_URI).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
