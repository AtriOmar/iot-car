/*
 * Melody definitions for the IoT Car
 * Add new melodies here as needed
 */

#ifndef MELODIES_H
#define MELODIES_H

#include "pitches.h"

// ==================== PIRATES OF THE CARIBBEAN ====================
// Copyright (c) 2022 HiBit <https://www.hibit.dev>

const int PIRATES_MELODY[] PROGMEM = {
    NOTE_E4, NOTE_G4, NOTE_A4, NOTE_A4, REST,
    NOTE_A4, NOTE_B4, NOTE_C5, NOTE_C5, REST,
    NOTE_C5, NOTE_D5, NOTE_B4, NOTE_B4, REST,
    NOTE_A4, NOTE_G4, NOTE_A4, REST,

    NOTE_E4, NOTE_G4, NOTE_A4, NOTE_A4, REST,
    NOTE_A4, NOTE_B4, NOTE_C5, NOTE_C5, REST,
    NOTE_C5, NOTE_D5, NOTE_B4, NOTE_B4, REST,
    NOTE_A4, NOTE_G4, NOTE_A4, REST,

    NOTE_E4, NOTE_G4, NOTE_A4, NOTE_A4, REST,
    NOTE_A4, NOTE_C5, NOTE_D5, NOTE_D5, REST,
    NOTE_D5, NOTE_E5, NOTE_F5, NOTE_F5, REST,
    NOTE_E5, NOTE_D5, NOTE_E5, NOTE_A4, REST,

    NOTE_A4, NOTE_B4, NOTE_C5, NOTE_C5, REST,
    NOTE_D5, NOTE_E5, NOTE_A4, REST,
    NOTE_A4, NOTE_C5, NOTE_B4, NOTE_B4, REST,
    NOTE_C5, NOTE_A4, NOTE_B4, REST,

    NOTE_A4, NOTE_A4,
    // Repeat of first part
    NOTE_A4, NOTE_B4, NOTE_C5, NOTE_C5, REST,
    NOTE_C5, NOTE_D5, NOTE_B4, NOTE_B4, REST,
    NOTE_A4, NOTE_G4, NOTE_A4, REST,

    NOTE_E4, NOTE_G4, NOTE_A4, NOTE_A4, REST,
    NOTE_A4, NOTE_B4, NOTE_C5, NOTE_C5, REST,
    NOTE_C5, NOTE_D5, NOTE_B4, NOTE_B4, REST,
    NOTE_A4, NOTE_G4, NOTE_A4, REST,

    NOTE_E4, NOTE_G4, NOTE_A4, NOTE_A4, REST,
    NOTE_A4, NOTE_C5, NOTE_D5, NOTE_D5, REST,
    NOTE_D5, NOTE_E5, NOTE_F5, NOTE_F5, REST,
    NOTE_E5, NOTE_D5, NOTE_E5, NOTE_A4, REST,

    NOTE_A4, NOTE_B4, NOTE_C5, NOTE_C5, REST,
    NOTE_D5, NOTE_E5, NOTE_A4, REST,
    NOTE_A4, NOTE_C5, NOTE_B4, NOTE_B4, REST,
    NOTE_C5, NOTE_A4, NOTE_B4, REST,
    // End of Repeat

    NOTE_E5, REST, REST, NOTE_F5, REST, REST,
    NOTE_E5, NOTE_E5, REST, NOTE_G5, REST, NOTE_E5, NOTE_D5, REST, REST,
    NOTE_D5, REST, REST, NOTE_C5, REST, REST,
    NOTE_B4, NOTE_C5, REST, NOTE_B4, REST, NOTE_A4,

    NOTE_E5, REST, REST, NOTE_F5, REST, REST,
    NOTE_E5, NOTE_E5, REST, NOTE_G5, REST, NOTE_E5, NOTE_D5, REST, REST,
    NOTE_D5, REST, REST, NOTE_C5, REST, REST,
    NOTE_B4, NOTE_C5, REST, NOTE_B4, REST, NOTE_A4};

const int PIRATES_DURATIONS[] PROGMEM = {
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8,

    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8,

    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 8, 4, 8,

    8, 8, 4, 8, 8,
    4, 8, 4, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 4,

    4, 8,
    // Repeat of First Part
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8,

    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8,

    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 8, 8,
    8, 8, 8, 4, 8,

    8, 8, 4, 8, 8,
    4, 8, 4, 8,
    8, 8, 4, 8, 8,
    8, 8, 4, 4,
    // End of Repeat

    4, 8, 4, 4, 8, 4,
    8, 8, 8, 8, 8, 8, 8, 8, 4,
    4, 8, 4, 4, 8, 4,
    8, 8, 8, 8, 8, 2,

    4, 8, 4, 4, 8, 4,
    8, 8, 8, 8, 8, 8, 8, 8, 4,
    4, 8, 4, 4, 8, 4,
    8, 8, 8, 8, 8, 2};

const int PIRATES_LENGTH = sizeof(PIRATES_DURATIONS) / sizeof(int);

// ==================== GAME OF THRONES ====================
// Copyright (c) 2022 HiBit <https://www.hibit.dev>

const int GOT_MELODY[] PROGMEM = {
    NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4,
    NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4,
    NOTE_G4, NOTE_C4, NOTE_E4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_E4, NOTE_F4,
    NOTE_G4, NOTE_C4, NOTE_E4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_E4, NOTE_F4,
    NOTE_G4, NOTE_C4,

    NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4,
    NOTE_D4,
    NOTE_F4, NOTE_AS3,
    NOTE_DS4, NOTE_D4, NOTE_F4, NOTE_AS3,
    NOTE_DS4, NOTE_D4, NOTE_C4,

    NOTE_G4, NOTE_C4,

    NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4,
    NOTE_D4,
    NOTE_F4, NOTE_AS3,
    NOTE_DS4, NOTE_D4, NOTE_F4, NOTE_AS3,
    NOTE_DS4, NOTE_D4, NOTE_C4,
    NOTE_G4, NOTE_C4,
    NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4,

    NOTE_D4,
    NOTE_F4, NOTE_AS3,
    NOTE_D4, NOTE_DS4, NOTE_D4, NOTE_AS3,
    NOTE_C4,
    NOTE_C5,
    NOTE_AS4,
    NOTE_C4,
    NOTE_G4,
    NOTE_DS4,
    NOTE_DS4, NOTE_F4,
    NOTE_G4,

    NOTE_C5,
    NOTE_AS4,
    NOTE_C4,
    NOTE_G4,
    NOTE_DS4,
    NOTE_DS4, NOTE_D4,
    NOTE_C5, NOTE_G4, NOTE_GS4, NOTE_AS4, NOTE_C5, NOTE_G4, NOTE_GS4, NOTE_AS4,
    NOTE_C5, NOTE_G4, NOTE_GS4, NOTE_AS4, NOTE_C5, NOTE_G4, NOTE_GS4, NOTE_AS4,

    REST, NOTE_GS5, NOTE_AS5, NOTE_C6, NOTE_G5, NOTE_GS5, NOTE_AS5,
    NOTE_C6, NOTE_G5, NOTE_GS5, NOTE_AS5, NOTE_C6, NOTE_G5, NOTE_GS5, NOTE_AS5};

const int GOT_DURATIONS[] PROGMEM = {
    8, 8, 16, 16, 8, 8, 16, 16,
    8, 8, 16, 16, 8, 8, 16, 16,
    8, 8, 16, 16, 8, 8, 16, 16,
    8, 8, 16, 16, 8, 8, 16, 16,
    4, 4,

    16, 16, 4, 4, 16, 16,
    1,
    4, 4,
    16, 16, 4, 4,
    16, 16, 1,

    4, 4,

    16, 16, 4, 4, 16, 16,
    1,
    4, 4,
    16, 16, 4, 4,
    16, 16, 1,
    4, 4,
    16, 16, 4, 4, 16, 16,

    2,
    4, 4,
    8, 8, 8, 8,
    1,
    2,
    2,
    2,
    2,
    2,
    4, 4,
    1,

    2,
    2,
    2,
    2,
    2,
    4, 4,
    8, 8, 16, 16, 8, 8, 16, 16,
    8, 8, 16, 16, 8, 8, 16, 16,

    4, 16, 16, 8, 8, 16, 16,
    8, 16, 16, 16, 8, 8, 16, 16};

const int GOT_LENGTH = sizeof(GOT_DURATIONS) / sizeof(int);

// Note: Game of Thrones uses 2000/duration instead of 1000/duration for slower tempo
const int GOT_TEMPO_MULTIPLIER = 2;

// ==================== SQUID GAME ====================
// Copyright (c) 2025 HiBit <https://www.hibit.dev>

const int SQUID_MELODY[] PROGMEM = {
    NOTE_F4, NOTE_F4, NOTE_F4, NOTE_D4, NOTE_DS4, NOTE_F4, REST,
    NOTE_F4, NOTE_F4, NOTE_F4, NOTE_D4, NOTE_DS4, NOTE_F4, REST,
    NOTE_G4, NOTE_G4, NOTE_G4, NOTE_A4, NOTE_AS4, NOTE_AS4, NOTE_A4, NOTE_G4,
    NOTE_F4, NOTE_F4, NOTE_F4, NOTE_G4, NOTE_F4, REST,

    NOTE_F4, NOTE_F4, NOTE_F4, NOTE_D4, NOTE_DS4, NOTE_F4, REST,
    NOTE_F4, NOTE_F4, NOTE_F4, NOTE_D4, NOTE_DS4, NOTE_F4, REST,
    NOTE_G4, NOTE_G4, NOTE_G4, NOTE_C5, NOTE_AS4, NOTE_A4, NOTE_G4, NOTE_A4, NOTE_AS4, NOTE_AS4, NOTE_AS4,

    REST};

const int SQUID_DURATIONS[] PROGMEM = {
    6, 6, 6, 4, 6, 2, 3,
    6, 6, 6, 4, 6, 2, 3,
    4, 6, 4, 6, 4, 6, 4, 6,
    4, 6, 4, 6, 2, 3,

    6, 6, 6, 4, 6, 2, 3,
    6, 6, 6, 4, 6, 2, 3,
    4, 6, 4, 6, 4, 6, 4, 6, 2, 2, 2,

    1};

const int SQUID_LENGTH = sizeof(SQUID_DURATIONS) / sizeof(int);

// ==================== MELODY PLAYER ====================

// Global state for non-blocking melody playback
volatile bool melodyPlaying = false;
volatile bool stopMelodyRequested = false;
int currentNote = 0;
unsigned long noteStartTime = 0;
unsigned long noteDuration = 0;
unsigned long pauseDuration = 0;
bool inPause = false;

// Available songs enum
enum Song
{
    SONG_NONE = 0,
    SONG_PIRATES = 1,
    SONG_GOT = 2,
    SONG_SQUID = 3
};

Song currentSong = SONG_NONE;
int songTempoMultiplier = 1; // For songs with different tempo

// Start playing a melody
void startMelody(Song song)
{
    if (song == SONG_NONE)
        return;

    currentSong = song;
    currentNote = 0;
    melodyPlaying = true;
    stopMelodyRequested = false;
    inPause = false;
    noteStartTime = millis();

    // Start the first note
    int freq = 0;
    int dur = 0;
    songTempoMultiplier = 1;

    switch (song)
    {
    case SONG_PIRATES:
        freq = pgm_read_word(&PIRATES_MELODY[0]);
        dur = pgm_read_word(&PIRATES_DURATIONS[0]);
        break;
    case SONG_GOT:
        freq = pgm_read_word(&GOT_MELODY[0]);
        dur = pgm_read_word(&GOT_DURATIONS[0]);
        songTempoMultiplier = GOT_TEMPO_MULTIPLIER;
        break;
    case SONG_SQUID:
        freq = pgm_read_word(&SQUID_MELODY[0]);
        dur = pgm_read_word(&SQUID_DURATIONS[0]);
        break;
    default:
        return;
    }

    noteDuration = (1000 * songTempoMultiplier) / dur;
    pauseDuration = noteDuration * 0.3;

    if (freq != REST)
    {
        tone(BEEPER_PIN, freq, noteDuration);
    }

    Serial.println("🎵 Starting melody playback");
}

// Stop the currently playing melody
void stopMelody()
{
    stopMelodyRequested = true;
    melodyPlaying = false;
    currentSong = SONG_NONE;
    noTone(BEEPER_PIN);
    // Reset the pin to digital output mode after tone
    pinMode(BEEPER_PIN, OUTPUT);
    digitalWrite(BEEPER_PIN, LOW);
    Serial.println("🎵 Melody stopped");
}

// Update melody playback (call this in loop())
void updateMelody()
{
    if (!melodyPlaying || stopMelodyRequested)
    {
        if (stopMelodyRequested)
        {
            melodyPlaying = false;
            currentSong = SONG_NONE;
            stopMelodyRequested = false;
            noTone(BEEPER_PIN);
        }
        return;
    }

    unsigned long currentTime = millis();

    if (inPause)
    {
        // We're in the pause between notes
        if (currentTime - noteStartTime >= pauseDuration)
        {
            inPause = false;
            currentNote++;

            // Check if melody is complete
            int melodyLength = 0;
            switch (currentSong)
            {
            case SONG_PIRATES:
                melodyLength = PIRATES_LENGTH;
                break;
            case SONG_GOT:
                melodyLength = GOT_LENGTH;
                break;
            case SONG_SQUID:
                melodyLength = SQUID_LENGTH;
                break;
            default:
                break;
            }

            if (currentNote >= melodyLength)
            {
                // Melody complete
                melodyPlaying = false;
                currentSong = SONG_NONE;
                noTone(BEEPER_PIN);
                // Reset the pin to digital output mode after tone
                pinMode(BEEPER_PIN, OUTPUT);
                digitalWrite(BEEPER_PIN, LOW);
                Serial.println("🎵 Melody complete");
                return;
            }

            // Play the next note
            int freq = 0;
            int dur = 0;

            switch (currentSong)
            {
            case SONG_PIRATES:
                freq = pgm_read_word(&PIRATES_MELODY[currentNote]);
                dur = pgm_read_word(&PIRATES_DURATIONS[currentNote]);
                break;
            case SONG_GOT:
                freq = pgm_read_word(&GOT_MELODY[currentNote]);
                dur = pgm_read_word(&GOT_DURATIONS[currentNote]);
                break;
            case SONG_SQUID:
                freq = pgm_read_word(&SQUID_MELODY[currentNote]);
                dur = pgm_read_word(&SQUID_DURATIONS[currentNote]);
                break;
            default:
                return;
            }

            noteDuration = (1000 * songTempoMultiplier) / dur;
            pauseDuration = noteDuration * 0.3;
            noteStartTime = currentTime;

            if (freq != REST)
            {
                tone(BEEPER_PIN, freq, noteDuration);
            }
        }
    }
    else
    {
        // We're playing a note
        if (currentTime - noteStartTime >= noteDuration)
        {
            noTone(BEEPER_PIN);
            inPause = true;
            noteStartTime = currentTime;
        }
    }
}

#endif
