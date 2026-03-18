# Product Requirements Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PRD.md is for BUSINESS FOCUS (WHAT & WHY) -->
<!-- For implementation details → see TECH.md -->
<!-- For timeline planning → see PLAN.md -->

**Version:** 2.1
**Date:** 2026-03-18
**Author:** Jerzy Maczewski
**Purpose:** Lekka natywna aplikacja desktopowa na Windows do podglądu obrazu z kamer systemowych (Tauri + GitHub Actions CI/CD)

---

## Executive Summary

Minimalistyczna aplikacja desktopowa na Windows, której jedynym celem jest wyświetlenie obrazu na żywo z wybranej kamery systemowej (webcam, kamera USB, kamera IP/wirtualna). Lekki soft — szybki start, mały footprint, zero zbędnych funkcji. Okno z możliwością zmiany rozmiaru i trybem pełnoekranowym.

---

## Problem Statement

### Current Challenges:
- Istniejące aplikacje do kamer (OBS, Camera app, VLC) są zbyt rozbudowane dla prostego podglądu
- Potrzeba szybkiego, dedykowanego narzędzia które robi jedną rzecz i robi ją dobrze
- Brak lekkiego softu "kliknij i patrz" na kamery systemowe Windows

### Business Context:
- Narzędzie osobiste / utility tool
- Platforma docelowa: Windows (natywna aplikacja desktopowa)
- Filozofia: jedna funkcja, zrobiona dobrze

---

## Target Users

### Primary Users:
1. **Jerzy (owner)** — szybki podgląd kamer podłączonych do systemu Windows, weryfikacja ustawień, monitoring

---

## Business Objectives

### Primary Goals:
1. **Wybór kamery** — lista dostępnych kamer systemowych do wyboru z dropdown
2. **Podgląd na żywo** — wyświetlanie strumienia wideo w czasie rzeczywistym
3. **Elastyczne okno** — zmiana rozmiaru okna aplikacji (resize)
4. **Fullscreen** — możliwość przełączenia na pełny ekran

---

## Functional Requirements

### FR1: Wybór kamery
- **FR1.1** Wyświetlenie listy wszystkich kamer rozpoznanych przez Windows
- **FR1.2** Wybór kamery z listy (dropdown / combobox)
- **FR1.3** Automatyczny wybór jedynej kamery, jeśli dostępna jest tylko jedna
- **FR1.4** Płynne przełączanie między kamerami (zmiana bez restartu aplikacji)

### FR2: Podgląd wideo
- **FR2.1** Wyświetlanie strumienia wideo na żywo z wybranej kamery
- **FR2.2** Obraz skaluje się proporcjonalnie do rozmiaru okna
- **FR2.3** Wyświetlanie informacji o aktualnej rozdzielczości strumienia

### FR3: Okno aplikacji
- **FR3.1** Klasyczny pasek tytułu Windows z dropdown wyboru kamery
- **FR3.2** Okno z możliwością zmiany rozmiaru (resizable)
- **FR3.3** Obraz dopasowuje się do rozmiaru okna (zachowując proporcje)
- **FR3.4** Fullscreen: skrót klawiszowy (F11), wyjście przez Esc
- **FR3.5** Domyślny rozmiar okna (stały, bez zapamiętywania)

### FR4: Menu kontekstowe (prawy klik na obszarze kamery)
- **FR4.1** Prawy klik w obszarze wideo otwiera menu kontekstowe
- **FR4.2** Opcje w menu: fullscreen, zmiana kamery, info o rozdzielczości
- **FR4.3** Menu jako alternatywna droga dostępu do wszystkich funkcji

---

## Non-functional Requirements

### Usability:
- **NFR1** Przenośny plik .exe (~8 MB) — budowany automatycznie przez GitHub Actions CI/CD
- **NFR2** Intuicyjny interfejs — max 2 kliknięcia do podglądu
- **NFR3** Minimalistyczny UI — tylko to co potrzebne (dropdown kamery + obraz + fullscreen)

### Zero Footprint:
- **NFR9** Aplikacja nie zapisuje NICZEGO na dysku — zero plików konfiguracyjnych, cache, logów
- **NFR10** Brak wpisów w AppData, rejestrze Windows, temp
- **NFR11** Deinstalacja = usunięcie samego .exe — nic więcej nie zostaje

### Performance:
- **NFR4** Szybki start aplikacji (< 3 sekundy do gotowości)
- **NFR5** Minimalne zużycie CPU/RAM — nie obciąża systemu w tle
- **NFR6** Płynny obraz — bez dodatkowych opóźnień w renderingu

### Compatibility:
- **NFR7** Windows 10/11 jako platforma docelowa
- **NFR8** Obsługa standardowych kamer systemowych (DirectShow / Media Foundation)

---

## Success Metrics

### Primary Metrics:
- **M1** ~~Czas do podglądu: < 5 sekund~~ ✅ Zweryfikowane
- **M2** ~~Rozmiar aplikacji: < 50 MB~~ ✅ 8 MB
- **M3** **CPU usage**: < 5% przy wyświetlaniu strumienia 1080p

---

## Constraints & Assumptions

### Technical Constraints:
- **C1** Aplikacja musi działać natywnie na Windows (nie w przeglądarce)
- **C2** Musi korzystać z kamer rozpoznanych przez system Windows

### Assumptions:
- **A1** Kamera jest podłączona i rozpoznana przez Windows przed uruchomieniem aplikacji
- **A2** Sterowniki kamery zainstalowane poprawnie
- **A3** Rozwój na WSL2 (Linux), build Windows .exe przez GitHub Actions CI/CD
- **A4** Repozytorium GitHub jako źródło kodu i pipeline budowania

---

## Acceptance Criteria

### Must Have:
- [x] Lista kamer systemowych w dropdown
- [x] Podgląd strumienia wideo na żywo z wybranej kamery
- [x] Zmiana rozmiaru okna z proporcjonalnym skalowaniem obrazu
- [x] Tryb pełnoekranowy (fullscreen)
- [ ] Zero footprint — weryfikacja braku plików po zamknięciu (do przetestowania)

### Could Have (przyszłość):
- [ ] Zapis zrzutu ekranu (screenshot z kamery)
- [ ] Wybór rozdzielczości z listy obsługiwanych
- [ ] Mirror/flip opcja
- [ ] Always-on-top (okno zawsze na wierzchu)
- [ ] Zapamiętywanie wybranej kamery między uruchomieniami (wymagałoby pliku config obok .exe)

---

*This PRD defines the business requirements for Live Cam. All implementation decisions should be validated against these requirements.*
