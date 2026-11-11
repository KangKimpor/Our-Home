import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ROOMS, ROOM_ORDER } from '../../data/rooms';
import { PET_SPECIES, PET_SPECIES_BY_ID, PET_TRAITS } from '../../data/pets';
import type { PetState, RoomId } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { AnimalArt, Bar, Button, Empty, Field, Modal, cx } from '../bits';
import { Icon } from '../icons';

function speciesName(id: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const def = PET_SPECIES_BY_ID[id];
  return def ? t(def.nameKey, { defaultValue: def.name }) : id;
}

function coatName(speciesId: string, coatId: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const coat = PET_SPECIES_BY_ID[speciesId]?.coats.find((entry) => entry.id === coatId);
  return coat ? t(coat.nameKey, { defaultValue: coat.name }) : coatId;
}

function happyTone(value: number): string {
  if (value >= 70) return 'pink';
  if (value >= 40) return 'butter';
  return 'dusty';
}

function PetCard({ pet, onOpen }: { pet: PetState; onOpen: () => void }) {
  const { t } = useTranslation();
  const petPet = useGameStore((s) => s.petPet);
  return (
    <article className="pet-card">
      <button type="button" className="pet-card-main" onClick={onOpen}>
        <span className="pet-portrait">
          <AnimalArt species={pet.species} coat={pet.coat} size={116} />
        </span>
        <span className="pet-card-text">
          <strong>{pet.name}</strong>
          <small>{t('pets.detail', {
            species: speciesName(pet.species, t),
            trait: t(`trait.${pet.trait}`),
            room: t(ROOMS[pet.roomId].nameKey),
          })}</small>
          <span className="pet-meter">
            <Icon name="heart" size={13} />
            <Bar value={pet.happiness} max={100} tone={happyTone(pet.happiness)} />
            <em>{Math.round(pet.happiness)}%</em>
          </span>
        </span>
      </button>
      <Button size="sm" variant="secondary" icon="paw" onClick={() => petPet(pet.id)}>
        {t('pets.pet')}
      </Button>
    </article>
  );
}

function PetDetail({ pet }: { pet: PetState }) {
  const { t } = useTranslation();
  const openOverlay = useGameStore((s) => s.openOverlay);
  const renamePet = useGameStore((s) => s.renamePet);
  const sendPetToRoom = useGameStore((s) => s.sendPetToRoom);
  const rooms = useGameStore((s) => s.state.rooms);
  const petPet = useGameStore((s) => s.petPet);
  const [name, setName] = useState(pet.name);
  const [roomOpen, setRoomOpen] = useState(false);

  return (
    <div className="pet-detail">
      <div className="pet-detail-head">
        <span className="pet-portrait pet-portrait-lg">
          <AnimalArt species={pet.species} coat={pet.coat} size={180} />
        </span>
        <div className="pet-detail-info">
          <h3>{pet.name}</h3>
          <p>{t('pets.detail', {
            species: speciesName(pet.species, t),
            trait: t(`trait.${pet.trait}`),
            room: t(ROOMS[pet.roomId].nameKey),
          })}</p>
          <div className="pet-happiness">
            <span>
              <Icon name="heart" size={16} /> {t('pets.happiness')}
            </span>
            <Bar value={pet.happiness} max={100} tone={happyTone(pet.happiness)} />
            <em>{Math.round(pet.happiness)}%</em>
          </div>
          <div className="pet-detail-actions">
            <Button size="sm" variant="primary" icon="paw" onClick={() => petPet(pet.id)}>
              {t('pets.pet')}
            </Button>
            <Button size="sm" variant="secondary" icon="bowl" onClick={() => openOverlay('feed', `pet:${pet.id}`)}>
              {t('pets.feed')}
            </Button>
            <Button size="sm" variant="ghost" icon="door" onClick={() => setRoomOpen((open) => !open)}>
              {t('pets.sendToRoom')}
            </Button>
          </div>
        </div>
      </div>

      {roomOpen ? (
        <div className="pet-room-picker">
          {ROOM_ORDER.filter((id) => rooms[id].unlocked).map((id) => (
            <button
              key={id}
              type="button"
              className={cx('room-choice', pet.roomId === id && 'is-active')}
              onClick={() => {
                sendPetToRoom(pet.id, id as RoomId);
                setRoomOpen(false);
              }}
            >
              <Icon name={ROOMS[id].outdoor ? 'leaf' : 'home'} size={18} />
              {t(ROOMS[id].nameKey)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="pet-rename">
        <Field label={t('pets.rename')}>
          <input
            type="text"
            value={name}
            maxLength={20}
            placeholder={t('pets.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Button
          size="sm"
          variant="secondary"
          icon="check"
          disabled={!name.trim() || name.trim() === pet.name}
          onClick={() => renamePet(pet.id, name)}
        >
          {t('pets.rename')}
        </Button>
      </div>
    </div>
  );
}

export function PetsPanel({ arg }: { arg?: string }) {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const adoptPet = useGameStore((s) => s.adoptPet);
  const notify = useGameStore((s) => s.notify);
  const [tab, setTab] = useState<'pets' | 'adopt'>('pets');
  const [species, setSpecies] = useState(PET_SPECIES[0].id);
  const [coat, setCoat] = useState(PET_SPECIES[0].coats[0].id);
  const [name, setName] = useState('');
  const [focusId, setFocusId] = useState<string | undefined>(arg);

  const focused = focusId ? state.pets.find((pet) => pet.id === focusId) : undefined;
  const speciesDef = PET_SPECIES_BY_ID[species];
  const canAdopt = Boolean(name.trim()) && state.pets.length < 6 && state.hearts >= (speciesDef?.price ?? 0);

  const coatOptions = useMemo(() => speciesDef?.coats ?? [], [speciesDef]);

  const chooseSpecies = (id: string) => {
    setSpecies(id);
    const def = PET_SPECIES_BY_ID[id];
    if (def) setCoat(def.coats[0].id);
  };

  return (
    <Modal
      title={focused ? focused.name : t('pets.title')}
      subtitle={focused ? t('pets.happiness') : t('pets.subtitle')}
      size="lg"
      icon={<Icon name="paw" size={22} />}
      onClose={closeOverlay}
    >
      {focused ? (
        <>
          <button type="button" className="link-back" onClick={() => setFocusId(undefined)}>
            <Icon name="chevronLeft" size={16} /> {t('common.back')}
          </button>
          <PetDetail pet={focused} />
        </>
      ) : (
        <>
          <div className="tabs">
            <button type="button" className={cx('tab', tab === 'pets' && 'is-active')} onClick={() => setTab('pets')}>
              <Icon name="paw" size={17} />
              <span>{t('pets.title')}</span>
              <span className="tab-count">{state.pets.length}</span>
            </button>
            <button type="button" className={cx('tab', tab === 'adopt' && 'is-active')} onClick={() => setTab('adopt')}>
              <Icon name="plus" size={17} />
              <span>{t('pets.adopt')}</span>
            </button>
          </div>

          {tab === 'pets' ? (
            state.pets.length === 0 ? (
              <Empty icon="paw">{t('pets.noPets')}</Empty>
            ) : (
              <div className="pet-grid">
                {state.pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} onOpen={() => setFocusId(pet.id)} />
                ))}
              </div>
            )
          ) : (
            <div className="adopt-layout">
              <div className="adopt-preview">
                <AnimalArt species={species} coat={coat} size={180} />
                <strong>{name.trim() || t('pets.namePlaceholder')}</strong>
                <small>
                  {speciesName(species, t)} · {coatName(species, coat, t)}
                </small>
              </div>
              <div className="adopt-form">
                <Field label={t('pets.species')}>
                  <div className="chip-row">
                    {PET_SPECIES.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={cx('chip', species === entry.id && 'is-active')}
                        onClick={() => chooseSpecies(entry.id)}
                      >
                        {t(entry.nameKey, { defaultValue: entry.name })}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={t('pets.coat')}>
                  <div className="chip-row">
                    {coatOptions.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={cx('chip', coat === entry.id && 'is-active')}
                        onClick={() => setCoat(entry.id)}
                      >
                        {t(entry.nameKey, { defaultValue: entry.name })}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={t('pets.adoptName')}>
                  <input
                    type="text"
                    value={name}
                    maxLength={20}
                    placeholder={t('pets.namePlaceholder')}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <div className="adopt-foot">
                  <span className={cx('price-tag', state.hearts < (speciesDef?.price ?? 0) && 'is-short')}>
                    <Icon name="heart" size={15} />
                    {speciesDef?.price ?? 0}
                  </span>
                  <Button
                    variant="primary"
                    icon="paw"
                    disabled={!canAdopt}
                    onClick={() => {
                      if (state.pets.length >= 6) {
                        notify('pets.max', 'warn');
                        return;
                      }
                      if (!canAdopt) {
                        notify('shop.insufficient', 'warn');
                        return;
                      }
                      adoptPet(species, coat, name.trim());
                      setName('');
                      setTab('pets');
                    }}
                  >
                    {t('pets.adopt')}
                  </Button>
                </div>
                {state.pets.length >= 6 ? <p className="muted">{t('pets.max')}</p> : null}
                {PET_TRAITS.length > 0 ? <p className="muted small">{t('pets.trait')}: {t('trait.curious')}</p> : null}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
