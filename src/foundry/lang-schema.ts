type LangEntries =
  | 'chemical'
  | 'drug'
  | 'toxin'
  | 'biochem'
  | 'nano'
  | 'electronic'
  | 'dermal'
  | 'inhalation'
  | 'injection'
  | 'oral'
  | 'classification'
  | 'substanceType'
  | 'application'
  | 'addiction'
  | 'addictionMod'
  | 'checkMod'
  | 'applicationMethods'
  | 'any'
  | 'isAntidote'
  | 'wearOffStress'
  | 'recurring'
  | 'trait'
  | 'morph'
  | 'ego'
  | 'save'
  | 'description'
  | 'reference'
  | 'negative'
  | 'positive'
  | 'cp'
  | 'mp'
  | 'cost'
  | 'bonus'
  | 'traitType'
  | 'level'
  | 'levels'
  | 'polarity'
  | 'restrictions'
  | 'triggers'
  | 'worth'
  | 'properties'
  | 'effects'
  | 'flex'
  | 'onTest'
  | 'insight'
  | 'vigor'
  | 'moxie'
  | 'threat'
  | 'initiative'
  | 'pool'
  | 'effect'
  | 'type'
  | 'create'
  | 'modifier'
  | 'id'
  | 'delete'
  | 'require'
  | 'state'
  | 'situational'
  | 'cog'
  | 'int'
  | 'ref'
  | 'sav'
  | 'som'
  | 'wil'
  | 'allActions'
  | 'linkedAptitude'
  | 'skillTests'
  | 'tests'
  | 'all'
  | 'physical'
  | 'physicalDamage'
  | 'mesh'
  | 'checks'
  | 'action'
  | 'rep'
  | 'group'
  | 'actions'
  | 'misc'
  | 'aptitude'
  | 'opponentsTests'
  | 'applyTo'
  | 'to'
  | "opponent's"
  | 'successTest'
  | 'confirm'
  | 'mental'
  | 'athletics'
  | 'deceive'
  | 'fray'
  | 'freeFall'
  | 'guns'
  | 'infosec'
  | 'infiltrate'
  | 'interface'
  | 'kinesics'
  | 'melee'
  | 'perceive'
  | 'persuade'
  | 'program'
  | 'provoke'
  | 'psi'
  | 'research'
  | 'survival'
  | 'exotic'
  | 'hardware'
  | 'know'
  | 'medicine'
  | 'pilot'
  | 'combat'
  | 'mental'
  | 'social'
  | 'technical'
  | 'vehicle'
  | 'academics'
  | 'arts'
  | 'interests'
  | 'professionalTraining'
  | 'skills'
  | 'aerospace'
  | 'armorer'
  | 'demolitions'
  | 'electronics'
  | 'groundcraft'
  | 'industrial'
  | 'nautical'
  | 'robotics'
  | 'biotech'
  | 'forensics'
  | 'paramedic'
  | 'pharmacology'
  | 'psychosurgery'
  | 'veterinary'
  | 'air'
  | 'ground'
  | 'nautical'
  | 'space'
  | 'animalHandling'
  | 'bow'
  | 'disguise'
  | 'escapeArtist'
  | 'plasmaCutter'
  | 'sleightOfHand'
  | 'throwingKnives'
  | 'whips'
  | 'skill'
  | 'category'
  | 'field'
  | 'oppose'
  | 'support'
  | 'motivation'
  | 'motivations'
  | 'objective'
  | 'stance'
  | 'add'
  | 'goal'
  | 'check'
  | 'profile'
  | 'aptitudes'
  | 'reputations'
  | 'reputation'
  | 'select'
  | 'trivial'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'score'
  | 'available'
  | 'favors'
  | 'active'
  | 'points'
  | 'total'
  | 'network'
  | 'specialization'
  | 'name'
  | 'editTotals'
  | 'filter'
  | 'canDefault'
  | 'trackMentalHealth'
  | 'muse'
  | 'playerCharacter'
  | 'rez'
  | 'customization'
  | 'morph'
  | 'gear'
  | 'niche'
  | 'numbers'
  | 'threatLevel'
  | 'stressValue'
  | 'minStressValue'
  | 'age'
  | 'aliases'
  | 'background'
  | 'career'
  | 'faction'
  | 'gender'
  | 'interest'
  | 'languages'
  | 'sex'
  | 'ai'
  | 'alien'
  | 'exhuman'
  | 'exsurgent'
  | 'neogenetic'
  | 'tech'
  | 'titan'
  | 'transhuman'
  | 'xenofauna'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'ultraviolet'
  | 'settings'
  | 'setup'
  | 'info'
  | 'npc'
  | 'status'
  | 'integration'
  | 'special'
  | 'mentalHealth'
  | 'prime'
  | 'alpha'
  | 'beta'
  | 'gamma'
  | 'shortRecharge'
  | 'longRecharge'
  | 'fork'
  | 'stress'
  | 'traumas'
  | 'alienation'
  | 'helplessness'
  | 'violence'
  | 'value'
  | 'base'
  | 'temporary'
  | 'useThreat'
  | 'theUnknown'
  | 'criticalSuccess'
  | 'superiorSuccessX2'
  | 'superiorSuccess'
  | 'success'
  | 'failure'
  | 'superiorFailure'
  | 'superiorFailureX2'
  | 'criticalFailure'
  | 'modifiers'
  | 'publicRoll'
  | 'whisperGM'
  | 'blindRoll'
  | 'successTest'
  | 'roll'
  | 'target'
  | 'temporaryEffects'
  | 'timeframes'
  | 'days'
  | 'hour'
  | 'minute'
  | 'second'
  | 'turn'
  | 'hours'
  | 'minutes'
  | 'seconds'
  | 'turns'
  | 'notes'
  | 'paused'
  | 'endOnRecharge'
  | 'autoRemove'
  | 'delay'
  | 'source'
  | 'duration'
  | 'remainingDelay'
  | 'flipRoll'
  | 'remainingDuration'
  | 'applied'
  | 'failed'
  | 'integrationTest'
  | 'back'
  | 'edit'
  | 'apply'
  | 'rollFlipped'
  | 'upgrade'
  | 'downgrade'
  | 'result'
  | 'noResults'
  | 'improved'
  | 'pc'
  | 'inventory'
  | 'pools'
  | 'derived'
  | 'durability'
  | 'lucidity'
  | 'woundsIgnored'
  | 'woundModifier'
  | 'woundThreshold'
  | 'deathRating'
  | 'traumasIgnored'
  | 'traumaModifier'
  | 'traumaThreshold'
  | 'insanityRating'
  | 'trauma'
  | 'traumas'
  | 'wound'
  | 'wounds'
  | 'health'
  | 'armorLayer'
  | 'layer'
  | 'energy'
  | 'kinetic'
  | 'layers'
  | 'armor'
  | 'base'
  | 'full'
  | 'movementRate'
  | 'movementRates'
  | 'movement'
  | 'boat'
  | 'hopper'
  | 'hover'
  | 'ionic'
  | 'microlight'
  | 'rotor'
  | 'swimmer'
  | 'thrustVector'
  | 'tracked'
  | 'walker'
  | 'wheeled'
  | 'winged'
  | 'painFilter'
  | 'biomorph'
  | 'synthmorph'
  | 'pod'
  | 'vehicle'
  | 'swarm'
  | 'infomorph'
  | 'biological'
  | 'robotic'
  | 'organic'
  | 'synthetic'
  | 'verySmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'veryLarge'
  | 'baseDurability'
  | 'bot'
  | 'gearPoints'
  | 'morphPoints'
  | 'rare'
  | 'subtype'
  | 'frame'
  | 'brain'
  | 'size'
  | 'unarmedDV'
  | 'limbs'
  | 'damage'
  | 'resource'
  | 'availability'
  | 'physicalHealth'
  | 'meshHealth'
  | 'complexity'
  | 'restricted'
  | 'homeDevice'
  | 'egoTraits'
  | 'morphTraits'
  | 'stat'
  | 'armorRating'
  | 'timers'
  | 'maxUses'
  | 'poolsRecovered'
  | 'recharge'
  | 'daily'
  | 'weekly'
  | 'arc'
  | 'refresh'
  | 'complete'
  | 'regainedPoints'
  | 'missing'
  | 'advance'
  | 'timers'
  | 'unspent'
  | 'anyway'
  | 'completed'
  | 'indefinite'
  | 'start'
  | 'ongoing'
  | 'takeTheInitiative'
  | 'takeExtraAction'
  | 'acquireClue'
  | 'negateGaffe'
  | 'ignoreWound'
  | 'ignoreTrauma'
  | 'introduceNPC'
  | 'introduceItem'
  | 'defineEnvironment'
  | 'defineRelationship'
  | 'timeAdvance'
  | 'heal'
  | 'inflict'
  | 'mode'
  | 'on'
  | 'off'
  | 'hardening'
  | 'extraTarget'
  | 'increasedDuration'
  | 'increasedEffect'
  | 'increasedPenetration'
  | 'increasedPower'
  | 'increasedRange'
  | 'infectionInfluences'
  | 'takeDV'
  | 'unique'
  | 'freePush'
  | 'infectionRating'
  | 'requireBioSubstrate'
  | 'triggeredEffects'
  | 'constant'
  | 'triggered'
  | 'usableTwice'
  | 'requirement'
  | 'test'
  | 'form'
  | 'toggle'
  | 'sleight'
  | 'chi'
  | 'epsilon'
  | 'actionTurns'
  | 'instant'
  | 'sustained'
  | 'automatic'
  | 'quick'
  | 'complex'
  | 'task'
  | 'infectionMod'
  | 'sleightType'
  | 'receded'
  | 'traits'
  | 'influence'
  | 'infection'
  | 'blinded'
  | 'confused'
  | 'dazed'
  | 'deafened'
  | 'grappled'
  | 'immobilized'
  | 'impaired'
  | 'impairedX2'
  | 'impairedX3'
  | 'incapacitated'
  | 'prone'
  | 'stunned'
  | 'unconscious'
  | 'conditions'
  | 'digimorph'
  | 'visionBased'
  | 'hearingBased'
  | 'spentPools'
  | 'surprise'
  | 'none'
  | 'alerted'
  | 'surprised'
  | 'location'
  | 'gravity'
  | 'inVacuum'
  | 'img'
  | 'vacuum'
  | 'aptitudeCheck'
  | 'ignoreMods'
  | 'rushing'
  | 'takingTime'
  | 'rush'
  | 'takeTime'
  | 'timeframe'
  | 'duration'
  | 'effectDuration'
  | 'taskActionTimeframe'
  | 'taskType'
  | 'skillTest'
  | 'applicable'
  | 'repTest'
  | 'favor'
  | 'keepingQuiet'
  | 'burnRep'
  | 'burnedRep'
  | 'burn'
  | 'ignoredModifiers'
  | 'remaining'
  | 'undo'
  | 'deleted'
  | 'armorLayerPenalty'
  | 'encumbered'
  | 'psiInfluence'
  | 'psiInfluences'
  | 'substrain'
  | 'psiChi'
  | 'selectFreePush'
  | 'psiGamma'
  | 'psiEpsilon'
  | 'sleights'
  | 'pushedChiSleight'
  | 'pushable'
  | 'pushed'
  | 'push'
  | 'influences'
  | 'firewall'
  | 'day'
  | 'useMuse'
  | 'useFirewall'
  | 'poolsRegained'
  | 'recharges'
  | 'shared'
  | 'digitalSpeed'
  | 'exoticMorphology'
  | 'unsleeve'
  | 'sleeve'
  | 'into'
  | 'innateArmor'
  | 'acquisition'
  | 'prehensileLimbs'
  | 'frameType'
  | 'label'
  | 'energyArmor'
  | 'kineticArmor'
  | 'morphType'
  | 'modular'
  | 'template'
  | 'token'
  | 'overburdened'
  | 'inherentArmor'
  | 'damageType'
  | 'reduceAVbyDV'
  | 'armorPiercing'
  | 'additional'
  | 'armorValue'
  | 'armorUsed'
  | 'removing'
  | 'stressTest'
  | 'stressfulExperience'
  | 'close'
  | 'healing'
  | 'repair'
  | 'per'
  | 'auto'
  | 'interval'
  | 'normal'
  | 'poor'
  | 'harsh'
  | 'healthRecovery'
  | 'innate'
  | 'recovery'
  | 'mindState'
  | 'reboot'
  | 'crashed'
  | 'app'
  | 'item'
  | 'macro'
  | 'opposeWith'
  | 'microgravity'
  | 'atmosphere'
  | 'character'
  | 'noFlipFlop'
  | 'allowRemoteControl'
  | 'unique'
  | 'jamming'
  | 'roller'
  | 'snake'
  | 'submarine'
  | 'verySlow'
  | 'slow'
  | 'medium'
  | 'fast'
  | 'veryFast'
  | 'range'
  | 'resleeve'
  | 'resleevingStress'
  | 'subsumedEgos'
  | 'current'
  | 'new'
  | 'controls'
  | 'default'
  | 'sleeved'
  | 'cyberbrain'
  | 'fakeEgoId'
  | 'fakeId'
  | 'shell'
  | 'update'
  | 'exists'
  | 'required'
  | 'fieldSkill'
  | '@Rep'
  | 'cRep'
  | 'fRep'
  | 'gRep'
  | 'iRep'
  | 'rRep'
  | 'xRep'
  | 'used'
  | 'trackReputations'
  | 'fakeEgoIDs'
  | 'abbr'
  | 'syntheticShell'
  | 'overview'
  | 'acronym'
  | 'starting'
  | 'characterDetails'
  | 'threatDetails'
  | 'commaSeperated'
  | 'egoType'
  | 'forkType'
  | 'biologicalBody'
  | 'initial'
  | 'reduction'
  | 'increase'
  | 'of'
  | 'final'
  | 'no'
  | 'permanently'
  | 'burning'
  | 'immediate'
  | 'realization'
  | 'notFound'
  | 'started'
  | 'taskAction'
  | 'activeRecharge'
  | 'taskActions'
  | 'half'
  | 'trackPoints'
  | 'ali'
  | 'exploration'
  | 'medical'
  | 'aircraft'
  | 'exoskeleton'
  | 'groundcraft'
  | 'hardsuit'
  | 'hybrid'
  | 'nauticalCraft'
  | 'personalTransportDevice'
  | 'spacecraft'
  | 'personal'
  | 'recon'
  | 'utility'
  | 'minSV'
  | 'taken'
  | 'refreshTimer'
  | 'agi'
  | 'asi'
  | 'uplift'
  | 'beforeMitigation'
  | 'personalArmorUsed'
  | 'commit'
  | 'stressType'
  | 'pierce'
  | 'additionalArmor'
  | 'amount'
  | 'removingArmor'
  | 'shellType'
  | 'passengers'
  | 'minHalve'
  | 'takeSV'
  | 'linked'
  | 'consumable'
  | 'keepQuiet'
  | 'rollInitiative'
  | 'actNow'
  | 'noInitiativeModificationsAvailable'
  | 'delayTurn'
  | 'extra'
  | 'act'
  | 'mental/MeshActionsOnly'
  | 'round'
  | 'updateInitiative'
  | 'noRoll'
  | 'unknown'
  | 'public'
  | 'blind'
  | 'use'
  | 'scene'
  | 'environment'
  | 'general'
  | 'clear'
  | 'halve'
  | 'ignored'
  | 'condition'
  | 'conditions'
  | 'immunity'
  | 'manuallyToggled'
  | 'computer'
  | 'aliOnly'
  | 'firewallRating'
  | 'distributed'
  | 'distributedDevices'
  | 'distribute'
  | 'reIntegrate'
  | 'useCredits'
  | 'credits'
  | 'localFirewall'
  | 'renderSheet'
  | 'keepOpen'
  | 'actorLink'
  | 'hostType'
  | 'both'
  | 'staticModifiers'
  | 'time'
  | 'quality'
  | 'quantity'
  | 'consumeOnUse'
  | 'detail'
  | 'covertness'
  | 'resultEffects'
  | 'criticalDamage'
  | 'criticalQuality'
  | 'breakTool'
  | 'extraAction'
  | 'colonist'
  | 'enclaver'
  | 'freelancer'
  | 'hyperelite'
  | 'indenture'
  | 'infolife'
  | 'isolate'
  | 'lost'
  | 'underclass'
  | 'academic'
  | 'covertOperative'
  | 'enforcer'
  | 'explorer'
  | 'face'
  | 'genehacker'
  | 'hacker'
  | 'investigator'
  | 'medic'
  | 'mindhacker'
  | 'scavenger'
  | 'scientist'
  | 'soldier'
  | 'techie'
  | 'animalHandler'
  | 'artist/icon'
  | 'async'
  | 'commander'
  | 'fighter'
  | 'forensicsSpecialist'
  | 'jack-of-all-trades'
  | 'jammer'
  | 'networker'
  | 'paramedic'
  | 'pilot'
  | 'rogue'
  | 'slacker'
  | 'spacer'
  | 'student'
  | 'survivalist'
  | 'anarchist'
  | 'argonaut'
  | 'barsoomian'
  | 'brinker'
  | 'criminal'
  | 'extropian'
  | 'hypercorp'
  | 'jovian'
  | 'lunar/orbital'
  | 'mercurial'
  | 'reclaimer'
  | 'scum'
  | 'socialite'
  | 'titanian'
  | 'venusian'
  | 'regional'
  | 'ownHealing'
  | 'aidedHealing'
  | 'nextTick'
  | 'own'
  | 'aided'
  | 'timeSinceStressAccrued'
  | 'attempt'
  | 'disorder'
  | 'noNaturalHealsAttempted'
  | 'naturalHealAttempts'
  | 'attempts'
  | 'sources'
  | 'editor'
  | 'unarmedMelee'
  | 'hacking'
  | 'unarmed'
  | 'meleeAttack'
  | 'attack'
  | 'aggressive'
  | 'charging'
  | 'toHit'
  | 'touchOnly'
  | 'resultEffectsAvailable'
  | 'nextAction'
  | 'defaulting'
  | 'trackResourcePoints'
  | 'toggled'
  | 'concluded'
  | 'attacks'
  | 'skillCategory'
  | 'tags'
  | 'custom'
  | 'set'
  | 'fake'
  | 'activate'
  | 'tagType'
  | 'skillType'
  | 'toOpponent'
  | 'unignored'
  | 'egoAndMorph'
  | 'technologicallyAided'
  | 'light'
  | 'heavy'
  | 'untrigger'
  | 'trigger'
  | 'override'
  | 'view'
  | 'some'
  | 'baseInfectionRating'
  | 'infectionTest'
  | 'avoid'
  | 'self'
  | 'negated'
  | 'negate'
  | 'sleightTest'
  | 'biologicalLife'
  | 'meters'
  | 'pointBlank'
  | 'withinRange'
  | 'beyondRange'
  | 'distance'
  | 'opposition'
  | 'distracted'
  | 'psiUser'
  | 'change'
  | 'conditional'
  | 'summary'
  | 'mentalArmor'
  | 'provideMentalArmor'
  | 'blinding'
  | 'entangling'
  | 'knockdown'
  | 'pain'
  | 'shock'
  | 'stun'
  | 'attackTraits'
  | 'scaleEffectsOnSuperior'
  | 'psiTest'
  | 'finalize'
  | 'cognitive'
  | 'combat'
  | 'health'
  | 'nanodrug'
  | 'narcoalgorithm'
  | 'petal'
  | 'psi'
  | 'recreational'
  | 'social'
  | 'alwaysApplied'
  | 'formula'
  | 'over'
  | 'fail'
  | 'antidote'
  | 'doses'
  | 'layerable'
  | 'uses'
  | 'substance'
  | 'concealable'
  | 'fragile'
  | 'singleUse'
  | 'twoHanded'
  | 'bio'
  | 'cyber'
  | 'hard'
  | 'veryLow'
  | 'low'
  | 'average'
  | 'high'
  | 'veryHigh'
  | 'values'
  | 'hasActivation'
  | 'activated'
  | 'wareType'
  | 'checkoutTime'
  | 'interference'
  | 'equipped'
  | 'unequipped'
  | 'inactive'
  | 'singleShot'
  | 'semiAuto'
  | 'burstFire'
  | 'fullAuto'
  | 'suppressiveFire'
  | 'uniform'
  | 'centered'
  | 'grenade'
  | 'missile'
  | 'generic'
  | 'mini'
  | 'micro'
  | 'standard'
  | 'limitedUse'
  | 'multiUse'
  | 'openSource'
  | 'blueprint'
  | 'concentrated'
  | 'adjacentTargets'
  | 'explosive'
  | 'primaryMode'
  | 'secondaryMode'
  | 'sticky'
  | 'unitsPerComplexity'
  | 'damageValue'
  | 'explosiveType'
  | 'payload'
  | 'altMode'
  | 'minigrenade'
  | 'micromissile'
  | 'minimissile'
  | 'standardGrenade'
  | 'standardMissile'
  | 'areaEffectType'
  | 'unequip'
  | 'equip'
  | 'activate'
  | 'deactivate'
  | 'strengthBased'
  | 'wellCrafted'
  | 'stateOfTheArt'
  | 'topOfTheLine'
  | 'outdated'
  | 'shoddy'
  | 'inDisrepair'
  | 'blueprints'
  | 'devices'
  | 'details'
  | 'items'
  | 'abilities'
  | 'implantedWare'
  | 'ability'
  | 'appAsService'
  | 'appAsWare'
  | 'meshService'
  | 'meshware'
  | 'software'
  | 'mnemonics'
  | 'memoryRelated'
  | 'favorites'
  | 'undamaged'
  | 'barelyDamaged'
  | 'damaged'
  | 'badlyDamaged'
  | 'destroyed'
  | 'installed'
  | 'uninstall'
  | 'install'
  | 'search'
  | 'point'
  | 'meleeWeapon'
  | 'altAttackMode'
  | 'attackMode'
  | 'reachBonus'
  | 'augmentUnarmed'
  | 'improvised'
  | 'gearTraits'
  | 'coating'
  | 'cracked'
  | 'convert'
  | 'primary'
  | 'alt'
  | 'wieldedWith'
  | 'reps'
  | 'bypassArmor'
  | 'reach'
  | 'with'
  | 'opposing'
  | 'actor'
  | 'user'
  | 'bypassArmor'
  | 'disarm'
  | 'knockdown'
  | 'redirect'
  | 'specificTarget'
  | 'as'
  | 'mote'
  | 'host'
  | 'server'
  | 'physicalTech'
  | 'activation'
  | 'deviceType'
  | 'itemSize'
  | 'idealUserSize'
  | 'resisted'
  | 'ware'
  | 'when'
  | 'tag'
  | 'bioware'
  | 'cyberware'
  | 'nanoware'
  | 'drugOrToxin'
  | 'halved'
  | 'cumulative'
  | 'limb'
  | 'prehensile'
  | 'cause'
  | 'track'
  | 'progressTowardsRefresh'
  | 'activeForks'
  | 'backups'
  | 'backup'
  | 'date'
  | 'made'
  | 'whenMade'
  | 'tasks'
  | 'softwareType'
  | 'hasActiveState'
  | 'implanted'
  | 'alwaysApplies'
  | 'quantityPerCost'
  | 'mental/physical'
  | 'reduced'
  | 'increased'
  | 'by'
  | 'nonAddictive'
  | 'match'
  | 'cancel'
  | 'damageFormula'
  | 'coatWeapon'
  | 'weapon'
  | 'applyCoating'
  | 'coat'
  | 'deduct'
  | 'run'
  | 'applyEffects'
  | 'severity'
  | 'temporaryItem'
  | 'damageOverTime'
  | 'appliedSubstance'
  | 'restore'
  | 'substances'
  | 'awaiting'
  | 'onset'
  | 'in'
  | 'at'
  | 'endOfTurn'
  | 'endOfNextTurn'
  | 'running'
  | 'apps'
  | 'end'
  | 'accounting'
  | 'psychology'
  | 'enhancedBehavior'
  | 'realWorldNaivete'
  | 'obedient'
  | 'advancePersonalTime'
  | 'advance'
  | 'components'
  | 'beamWeapon'
  | 'primaryAttack'
  | 'secondaryAttack'
  | 'armSlide'
  | 'extendedMagazine'
  | 'gyromount'
  | 'imagingScope'
  | 'flashSuppressor'
  | 'laserSight'
  | 'safetySystem'
  | 'shockSafety'
  | 'silencer'
  | 'smartlink'
  | 'smartMagazine'
  | 'weaponAccessories'
  | 'fixed'
  | 'long'
  | 'noPointBlank'
  | 'noClose'
  | 'steady'
  | 'firingModes'
  | 'armorRemoving'
  | 'progressTowards'
  | 'charge'
  | 'max'
  | 'icon'
  | 'reload'
  | 'originalRange'
  | 'effectiveRange'
  | 'rangedAttack'
  | 'concentratedToHit'
  | 'concentratedDamage'
  | 'adjacentTargets'
  | 'armorReduction'
  | 'take'
  | 'effectType'
  | 'areaEffect'
  | 'areaEffectRadius'
  | 'augmentation'
  | 'disable'
  | 'usabilityModification'
  | 'endProcess'
  | 'canContainPayload'
  | 'radius'
  | 'painResistance'
  | 'resistInfection'
  | 'resistSubstanceOrDisease'
  | 'meleeDamageRolls'
  | 'dvModifier'
  | 'negativeRangeModifiersMultiplier'
  | 'ranged'
  | 'healingTimeframes'
  | 'durationFormula'
  | 'sleeves'
  | 'remove'
  | 'temporarily'
  | 'physicalServices'
  | 'physicalService'
  | 'service'
  | 'expired'
  | 'elapsed'
  | 'shop'
  | 'costType'
  | 'lose'
  | 'learn'
  | 'gain'
  | 'empty'
  | 'itemTrash'
  | 'services'
  | 'serviceType'
  | 'using'
  | 'gamemaster'
  | 'players'
  | 'online'
  | 'offline'
  | 'downtime'
  | 'accumulated'
  | 'hasAttack'
  | 'trackMeshHealth'
  | 'operatingSystem'
  | 'ready'
  | 'embeddedEgos'
  | 'deviceManagement'
  | 'stash'
  | 'placeEgo'
  | 'unset'
  | 'accountShells'
  | 'accountShell'
  | 'public'
  | 'security'
  | 'admin'
  | 'systemName'
  | 'privilege'
  | 'multiplier'
  | 'damageApplier'
  | 'calledShot'
  | 'ignoresArmor'
  | 'cone'
  | 'firingMode'
  | 'targetDistance'
  | 'ammoUsed'
  | 'weaponRange'
  | 'additionalDv'
  | 'lineOfSight'
  | 'aim'
  | 'physicalFullDefense'
  | 'mentalFullDefense'
  | 'expend'
  | 'resisting'
  | 'defending'
  | 'expending'
  | 'attackingOrSpotting'
  | 'lacksSmartlink'
  | 'fullMove'
  | 'braced'
  | 'carried'
  | 'resultImproved'
  | 'short'
  | 'now'
  | 'holdoutPistol'
  | 'mediumPistol'
  | 'heavyPistol'
  | 'machinePistol'
  | 'submachineGun'
  | 'assaultRifle'
  | 'battleRifle'
  | 'machineGun'
  | 'sniperRifle'
  | 'railgun'
  | 'firearm'
  | 'battery'
  | 'accessories'
  | 'class'
  | 'capacity'
  | 'loaded'
  | 'ammo'
  | 'locateFiredWeapon'
  | 'firearmAmmo'
  | 'ammunition'
  | 'noDamage'
  | 'transformer'
  | 'incompatibleWith'
  | 'missiles'
  | 'unload'
  | 'sprayWeapon'
  | 'coatAmmunition'
  | 'firePayload'
  | 'consumables'
  | 'superiorSuccessDot'
  | 'payloadUse'
  | 'dosesPerShot'
  | 'airburst'
  | 'impact'
  | 'proximity'
  | 'signal'
  | 'timer'
  | 'damageAgainstStructures'
  | 'shape'
  | 'structuralWeakpoint'
  | 'disarmDifficulty'
  | 'containSubstance'
  | 'lasts'
  | 'thrownAttack'
  | 'throwingRange'
  | 'timerDuration'
  | 'detonate'
  | 'seekerWeapon'
  | 'thrownWeapon'
  | 'alternativeAmmo'
  | 'primaryAmmo'
  | 'missileCapacity'
  | 'missileSize'
  | 'incorrectMissileSize'
  | 'accushot'
  | 'homing'
  | 'aptitudeMultiplier'
  | 'dropSleight/Trait'
  | 'hasSeverity'
  | 'specialized'
  | 'gland'
  | 'fab'
  | 'glands'
  | 'readyIn'
  | 'fabricator'
  | 'canOnlyGlandSubstances'
  | 'itemMustBeBlueprint'
  | 'severe'
  | 'perTurn'
  | 'carryPayload'
  | 'took'
  | 'history'
  | 'setHealthTo'
  | 'healed'
  | 'inflicted'
  | 'changes'
  | 'grant'
  | 'modify'
  | 'isSwarm'
  | 'passive'
  | 'movementType'
  | 'reset'
  | 'image'
  | 'upgrades'
  | 'mentalEdits'
  | 'forks'
  | 'sort'
  | 'a-z'
  | 'z-a'
  | 'leastPoints'
  | 'mostPoints'
  | 'goals'
  | 'additionalNotes'
  | 'minimumStress'
  | 'value'
  | 'copy'
  | 'non-electronic'
  | 'drop'
  | 'rounds'
  | 'roundsPerComplexity'
  | 'ammoClass'
  | 'programmableModes'
  | 'dosesPerUnit'
  | 'availableShots'
  | 'common'
  | 'alter'
  | 'hauntingVirus'
  | 'mindstealer'
  | 'skrik'
  | 'Watts-MacLeod'
  | 'whisper'
  | 'xenomorph'
  | 'strain'
  | 'substrain'
  | 'shapeChanging'
  | 'shapes'
  | 'shapeName'
  | 'meshAttacks'
  | 'useMeshArmor'
  | 'checkSuccess'
  | 'checkFailure'
  | 'criticalCheckFailure'
  | 'impairmentModifier'
  | 'for'
  | 'checkModifier'
  | 'armorAsModifier'
  | 'additionalDurationPerSuperior'
  | 'impairment'
  | 'static'
  | 'variable'
  | 'folder'
  | 'passiveAndActivated'
  | 'passiveOrActivated'
  | 'passiveAndUsable'
  | 'effectStates'
  | 'usedEffectsDuration'
  | 'resistEffectsCheck'
  | 'activationAction'
  | 'process'
  | 'damageRepair'
  | 'woundRepair'
  | 'firewallHealth'
  | 'onboardALI'
  | 'PassiveEffectsWhenActivated'
  | 'deviceALI'
  | 'selected'
  | 'keep'
  | 'stashed'
  | 'regainAllPools'
  | 'rewind'
  | 'refreshIn'
  | 'spend'
  | 'fabber'
  | 'creator'
  | 'printDuration'
  | 'fabbersAndGlands'
  | 'carry'
  | 'masterDevice'
  | 'slaved'
  | 'rewound'
  | 'advanced'
  | 'from'
  | 'picker'
  | 'minimum'
  | 'browse'
  | 'encounteringThreat'
  | 'glitchOnMeshWounds'
  | 'glitch'
  | 'versus'
  | 'disorientation'
  | 'acuteStress'
  | 'unconsciousness'
  | 'tick'
  | 'recover'
  | 'closeOnSave'
  | 'timeSinceNaturalHealAttempt'
  | 'naturalHeal'
  | 'ago'
  | 'timeToReboot'
  | 'hide'
  | 'less'
  | 'more'
  | 'applicationMethod'
  | 'substancesAwaitingOnset'
  | 'halveDrugEffects'
  | 'controlled'
  | 'actors'
  | 'characters'
  | 'done'
  | 'hidden'
  | 'cummulative'
  | 'beforeModifiers'
  | 'resist'
  | 'finished'
  | 'stats'
  | 'n/a'
  | 'throw'
  | 'plant'
  | 'reclaim'
  | 'detonated'
  | 'reclaimed'
  | 'secondary'
  | 'place'
  | 'visible'
  | 'targets'
  | 'adjust'
  | 'meter'
  | 'demolition'
  | 'testResult'
  | 'angle'
  | 'degrees'
  | 'detonationPeriod'
  | 'defuse'
  | 'defused'
  | 'useSubstance'
  | 'applyableFor'
  | 'shaped'
  | 'triggerRadius'
  | 'detonation'
  | 'explodeAfter'
  | 'extraWeapon'
  | 'improveResult'
  | 'flipFlopRoll'
  | 'not'
  | 'cannot'
  | 'original'
  | 'complementary'
  | 'minimize'
  | 'MarkFavorAsUsed'
  | 'covertness'
  | 'detail'
  | 'superior'
  | 'serviceDuration'
  | 'message'
  | 'woundAmount'
  | 'load'
  | 'entity'
  | 'complexAim'
  | 'fullDefense'
  | 'oneHand'
  | 'oneHanded'
  | 'extraWeapons'
  | 'defendWith'
  | 'blindness'
  | 'entangled'
  | 'breakFree'
  | 'takeNextFullActionToFlee'
  | 'bleedingOut'
  | 'regainWits'
  | 'suffer'
  | 'acuteStressResponse'
  | 'successful'
  | 'addicted'
  | 'attackTraitNotes'
  | 'areaEffectNotes'
  | 'dissipated'
  | 'dissipates'
  | 'reRoll'
  | 'interrupt'
  | 'defend'
  | 'normally'
  | 'interrupts'
  | 'delays'
  | 'multiple'
  | 'initiatives'
  | 'npcs'
  | 'tracker'
  | 'skipDefeated'
  | 'preperation'
  | 'fallDown'
  | 'uncoated'
  | 'discard';
type FullNames =
  | 'cog'
  | 'int'
  | 'ref'
  | 'sav'
  | 'som'
  | 'wil'
  | '@Rep'
  | 'cRep'
  | 'fRep'
  | 'gRep'
  | 'iRep'
  | 'rRep'
  | 'xRep';
export type Abbreviation =
  | 'woundThreshold'
  | 'woundsIgnored'
  | 'deathRating'
  | 'durability'
  | 'lucidity'
  | 'traumaThreshold'
  | 'traumasIgnored'
  | 'insanityRating'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'rare'
  | 'armorPiercing'
  | 'armorValue'
  | 'stressValue'
  | 'damageValue'
  | 'gearPoints'
  | 'morphPoints'
  | 'app'
  | 'dermal'
  | 'inhalation'
  | 'injection'
  | 'oral'
  | 'veryLow'
  | 'low'
  | 'average'
  | 'high'
  | 'veryHigh'
  | 'singleShot'
  | 'semiAuto'
  | 'burstFire'
  | 'fullAuto'
  | 'suppressiveFire'
  | 'armorRating'
  | 'modifier'
  | 'bioware'
  | 'hardware'
  | 'cyberware'
  | 'nanoware'
  | 'meshware'
  | 'shortRecharge'
  | 'longRecharge'
  | 'versus'
  | 'modifiers';
export type DescriptionEntry =
  | 'medicineHeal'
  | 'invalidRollFormula'
  | 'integrationTest'
  | 'confused'
  | 'blinded'
  | 'dazed'
  | 'grappled'
  | 'immobilized'
  | 'incapacitated'
  | 'prone'
  | 'unconscious'
  | 'stunned'
  | 'deafened'
  | 'OnlyWarePoolBonus'
  | 'AddItemInfo'
  | 'OnlyMorphTraits'
  | 'OnlyInfomorphItems'
  | 'AppliesSwarmRules'
  | 'OnlyPhysicalMorphItems'
  | 'OnlyWareItems'
  | 'OnlyEgoItems'
  | 'OnlyEgoTraits'
  | 'EgoAlreadyHasPsi'
  | 'CannotAddPsi'
  | 'NonElectronicSubstanceOnly'
  | 'Overburdened'
  | 'Encumbered'
  | 'TheBodyDies'
  | 'DestroyedBeyondRepair'
  | 'PermanentEgoMeltdown'
  | 'PermanentlyCorrupted'
  | 'SuperiorResultQuality'
  | 'SuperiorResultQuantity'
  | 'SuperiorResultDetail'
  | 'SuperiorResultTime'
  | 'SuperiorResultCovertness'
  | 'SuperiorResultDamage'
  | 'EndCombat';

// TODO Look into using data keys as pattern to validate json string
export type Formatable = {
  NoMatching: ['type', 'name'];
  NoMore: ['name'];
  DotPerTurnNoArmor: ['formula'];
  TakeSVWhenWearsOff: ['wearOffStress', 'substanceType'];
  OnCheckFailure: ['aptitude'];
  ArmorReduced: ['armor', 'value'];
  AlreadyHasItem: ['ownerName', 'itemName'];
  MismatchedAmmoClasses: ['firearm', 'ammo'];
  CannotLoadMissileSize: ['missileSize', 'availableSizes'];
  SleevePermanentlyDeleted: ['name'];
  ActionToActivate: ['action'];
  ModifiedTime: ['direction', 'amount'];
};

export interface Lang {
  'Eclipse Phase 2e': string;
  EP2E: Record<LangEntries, string> & {
    FULL: Record<FullNames, string>;
  } & {
    SHORT: Record<Abbreviation, string>;
  } & {
    DESCRIPTIONS: Record<DescriptionEntry, string>;
  } & {
    FORMATABLE: Record<keyof Formatable, string>;
  };
}
