import { useEffect, useRef, useCallback, useState } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Character } from '../types';
import { MAPS, getMobTemplate } from './mapData';
import { TILE_COLORS, CLASS_SPRITE_COLORS, type MapData, type Position, type MapNPC, type MapMob } from './types';

interface GameCanvasProps {
  character: Character;
  width?: number;
  height?: number;
  onMobClick?: (mob: MapMob) => void;
  onNPCClick?: (npc: MapNPC) => void;
  onPortalClick?: (portalId: string, targetMapId: string) => void;
}

export default function GameCanvas({
  character,
  width = 800,
  height = 500,
  onMobClick,
  onNPCClick,
  onPortalClick,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const characterSpriteRef = useRef<Container | null>(null);
  const [playerPosition, setPlayerPosition] = useState<Position>({
    x: character.position_x,
    y: character.position_y,
  });
  const [currentMap, setCurrentMap] = useState<MapData | null>(null);

  // Load current map
  useEffect(() => {
    const mapId = character.map_id || 'starting_village';
    const map = MAPS[mapId];
    if (map) {
      setCurrentMap(map);
      setPlayerPosition({ x: character.position_x, y: character.position_y });
    }
  }, [character.map_id, character.position_x, character.position_y]);

  // Create tile-based map
  const createMapLayer = useCallback(
    (app: Application, mapData: MapData) => {
      const mapContainer = new Container();
      const tileSize = mapData.tileSize;

      // Calculate offset to center map
      const mapPixelWidth = mapData.width * tileSize;
      const mapPixelHeight = mapData.height * tileSize;
      const offsetX = (app.screen.width - mapPixelWidth) / 2;
      const offsetY = (app.screen.height - mapPixelHeight) / 2;

      // Draw tiles
      for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
          const tile = mapData.tiles[y][x];
          const tileGraphic = new Graphics();

          const color = TILE_COLORS[tile.type] || 0x333333;
          tileGraphic.rect(0, 0, tileSize - 1, tileSize - 1);
          tileGraphic.fill(color);

          // Add subtle border
          tileGraphic.rect(0, 0, tileSize - 1, tileSize - 1);
          tileGraphic.stroke({ width: 1, color: 0x000000, alpha: 0.2 });

          tileGraphic.position.set(offsetX + x * tileSize, offsetY + y * tileSize);
          mapContainer.addChild(tileGraphic);
        }
      }

      // Draw portals
      mapData.portals.forEach((portal) => {
        const portalGraphic = new Graphics();
        const px = offsetX + portal.position.x * tileSize + tileSize / 2;
        const py = offsetY + portal.position.y * tileSize + tileSize / 2;

        // Glowing portal effect
        portalGraphic.circle(0, 0, tileSize / 2 - 5);
        portalGraphic.fill({ color: 0x9933ff, alpha: 0.7 });
        portalGraphic.circle(0, 0, tileSize / 2 - 8);
        portalGraphic.fill({ color: 0xcc66ff, alpha: 0.5 });

        // Portal label
        const labelText = new Text({
          text: portal.label,
          style: new TextStyle({
            fontSize: 10,
            fill: 0xffffff,
            fontWeight: 'bold',
          }),
        });
        labelText.anchor.set(0.5);
        labelText.position.set(0, tileSize / 2 + 5);

        const portalContainer = new Container();
        portalContainer.addChild(portalGraphic, labelText);
        portalContainer.position.set(px, py);
        portalContainer.eventMode = 'static';
        portalContainer.cursor = 'pointer';
        portalContainer.on('pointerdown', () => {
          onPortalClick?.(portal.id, portal.targetMapId);
        });

        mapContainer.addChild(portalContainer);
      });

      // Draw NPCs
      mapData.npcs.forEach((npc) => {
        const npcContainer = new Container();
        const nx = offsetX + npc.position.x * tileSize + tileSize / 2;
        const ny = offsetY + npc.position.y * tileSize + tileSize / 2;

        // NPC body
        const npcBody = new Graphics();
        npcBody.circle(0, -10, 12);
        npcBody.fill(0xffcc00);
        npcBody.stroke({ width: 2, color: 0xcc9900 });

        // NPC head
        const npcHead = new Graphics();
        npcHead.circle(0, -28, 8);
        npcHead.fill(0xffcc99);
        npcHead.stroke({ width: 1, color: 0xcc9966 });

        // NPC type indicator
        const typeIcon: Record<string, string> = {
          merchant: '💰',
          quest_giver: '❗',
          blacksmith: '🔨',
          trainer: '📚',
          banker: '🏦',
          guild_master: '👑',
        };

        const iconText = new Text({
          text: typeIcon[npc.type] || '?',
          style: new TextStyle({ fontSize: 14 }),
        });
        iconText.anchor.set(0.5);
        iconText.position.set(0, -45);

        // NPC name
        const nameText = new Text({
          text: npc.name,
          style: new TextStyle({
            fontSize: 10,
            fill: 0xffcc00,
            fontWeight: 'bold',
          }),
        });
        nameText.anchor.set(0.5);
        nameText.position.set(0, 10);

        npcContainer.addChild(npcBody, npcHead, iconText, nameText);
        npcContainer.position.set(nx, ny);
        npcContainer.eventMode = 'static';
        npcContainer.cursor = 'pointer';
        npcContainer.on('pointerdown', () => {
          onNPCClick?.(npc);
        });

        mapContainer.addChild(npcContainer);
      });

      // Draw mobs
      mapData.mobs.forEach((mob) => {
        const mobTemplate = getMobTemplate(mob.mobTemplateId);
        if (!mobTemplate) return;

        const mobContainer = new Container();
        const mx = offsetX + mob.position.x * tileSize + tileSize / 2;
        const my = offsetY + mob.position.y * tileSize + tileSize / 2;

        // Mob body - color based on level/type
        let mobColor = 0xcc3333; // Default red
        if (mob.isBoss) {
          mobColor = 0xff3300;
        } else if (mob.isElite) {
          mobColor = 0xcc6600;
        }

        const mobBody = new Graphics();
        mobBody.circle(0, -10, mob.isBoss ? 18 : 12);
        mobBody.fill(mobColor);
        mobBody.stroke({ width: 2, color: 0x000000 });

        // Boss/Elite indicator
        if (mob.isBoss || mob.isElite) {
          const crownText = new Text({
            text: mob.isBoss ? '👑' : '⭐',
            style: new TextStyle({ fontSize: 12 }),
          });
          crownText.anchor.set(0.5);
          crownText.position.set(0, mob.isBoss ? -35 : -30);
          mobContainer.addChild(crownText);
        }

        // Mob name and level
        const mobNameText = new Text({
          text: `${mobTemplate.name} Lv.${mob.level}`,
          style: new TextStyle({
            fontSize: 9,
            fill: mob.isBoss ? 0xff6600 : 0xff3333,
            fontWeight: 'bold',
          }),
        });
        mobNameText.anchor.set(0.5);
        mobNameText.position.set(0, 10);

        mobContainer.addChild(mobBody, mobNameText);
        mobContainer.position.set(mx, my);
        mobContainer.eventMode = 'static';
        mobContainer.cursor = 'pointer';
        mobContainer.on('pointerdown', () => {
          onMobClick?.(mob);
        });

        mapContainer.addChild(mobContainer);
      });

      return { mapContainer, offsetX, offsetY, tileSize };
    },
    [onMobClick, onNPCClick, onPortalClick]
  );

  // Create player character sprite
  const createPlayerSprite = useCallback(
    (position: Position, tileSize: number, offsetX: number, offsetY: number) => {
      const container = new Container();
      const color = CLASS_SPRITE_COLORS[character.class] || 0xcccccc;

      // Character body
      const body = new Graphics();
      body.circle(0, -15, 14);
      body.fill(color);
      body.stroke({ width: 3, color: 0xffffff });

      // Character head
      const head = new Graphics();
      head.circle(0, -35, 10);
      body.fill(0xffcc99);
      head.stroke({ width: 2, color: 0xcc9966 });

      // Character name
      const nameStyle = new TextStyle({
        fontSize: 11,
        fill: 0x00ff00,
        fontWeight: 'bold',
        dropShadow: {
          color: 0x000000,
          blur: 2,
          distance: 1,
        },
      });
      const nameText = new Text({ text: character.name, style: nameStyle });
      nameText.anchor.set(0.5);
      nameText.position.set(0, 5);

      // Level badge
      const levelBadge = new Graphics();
      levelBadge.circle(18, -35, 9);
      levelBadge.fill(0x333333);
      levelBadge.stroke({ width: 2, color: 0xffcc00 });

      const levelText = new Text({
        text: character.level.toString(),
        style: new TextStyle({ fontSize: 9, fill: 0xffffff, fontWeight: 'bold' }),
      });
      levelText.anchor.set(0.5);
      levelText.position.set(18, -35);

      // HP Bar
      const hpBarBg = new Graphics();
      hpBarBg.roundRect(-20, -55, 40, 6, 2);
      hpBarBg.fill(0x333333);

      const hpPercent = Math.max(0, Math.min(1, character.hp / character.max_hp));
      const hpBar = new Graphics();
      hpBar.roundRect(-19, -54, 38 * hpPercent, 4, 1);
      hpBar.fill(hpPercent > 0.3 ? 0x33cc33 : 0xff3333);

      // MP Bar
      const mpBarBg = new Graphics();
      mpBarBg.roundRect(-20, -48, 40, 4, 2);
      mpBarBg.fill(0x333333);

      const mpPercent = Math.max(0, Math.min(1, character.mp / character.max_mp));
      const mpBar = new Graphics();
      mpBar.roundRect(-19, -47, 38 * mpPercent, 2, 1);
      mpBar.fill(0x3399ff);

      container.addChild(body, head, hpBarBg, hpBar, mpBarBg, mpBar, levelBadge, levelText, nameText);

      // Position on map
      const px = offsetX + position.x * tileSize + tileSize / 2;
      const py = offsetY + position.y * tileSize + tileSize / 2;
      container.position.set(px, py);

      return container;
    },
    [character]
  );

  // Create UI overlay
  const createUIOverlay = useCallback(
    (app: Application, mapData: MapData) => {
      const ui = new Container();

      // Top left - Map name and location
      const locationBg = new Graphics();
      locationBg.roundRect(10, 10, 200, 50, 5);
      locationBg.fill({ color: 0x000000, alpha: 0.7 });

      const mapNameText = new Text({
        text: mapData.nameTR,
        style: new TextStyle({ fontSize: 14, fill: 0xffffff, fontWeight: 'bold' }),
      });
      mapNameText.position.set(20, 18);

      const coordText = new Text({
        text: `Konum: (${playerPosition.x}, ${playerPosition.y})`,
        style: new TextStyle({ fontSize: 11, fill: 0xcccccc }),
      });
      coordText.position.set(20, 38);

      // Top right - Character stats
      const statsBg = new Graphics();
      statsBg.roundRect(app.screen.width - 140, 10, 130, 90, 5);
      statsBg.fill({ color: 0x000000, alpha: 0.7 });

      const statsText = new Text({
        text: `ATK: ${character.attack}\nDEF: ${character.defense}\nSPD: ${character.speed}\nCRT: ${(character.crit_rate * 100).toFixed(0)}%\nGold: ${character.gold.toLocaleString()}`,
        style: new TextStyle({ fontSize: 10, fill: 0xcccccc, lineHeight: 16 }),
      });
      statsText.position.set(app.screen.width - 130, 18);

      // Bottom - Instructions
      const helpBg = new Graphics();
      helpBg.roundRect(10, app.screen.height - 35, 300, 25, 5);
      helpBg.fill({ color: 0x000000, alpha: 0.5 });

      const helpText = new Text({
        text: 'Tikla: Hareket | NPC/Mob: Etkilesim | Portal: Isınla',
        style: new TextStyle({ fontSize: 10, fill: 0x999999 }),
      });
      helpText.position.set(20, app.screen.height - 28);

      ui.addChild(locationBg, mapNameText, coordText, statsBg, statsText, helpBg, helpText);
      return ui;
    },
    [character, playerPosition]
  );

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current || !currentMap) return;

    const initPixi = async () => {
      // Clean up existing app
      if (appRef.current) {
        appRef.current.destroy(true);
      }

      const app = new Application();
      await app.init({
        width,
        height,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas);
      appRef.current = app;

      // Create map layer
      const { mapContainer, offsetX, offsetY, tileSize } = createMapLayer(app, currentMap);
      app.stage.addChild(mapContainer);

      // Create player sprite
      const playerSprite = createPlayerSprite(playerPosition, tileSize, offsetX, offsetY);
      characterSpriteRef.current = playerSprite;
      app.stage.addChild(playerSprite);

      // Create UI overlay
      const ui = createUIOverlay(app, currentMap);
      app.stage.addChild(ui);

      // Click to move
      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;
      app.stage.on('pointerdown', (event) => {
        // Calculate tile position from click
        const clickX = event.globalX;
        const clickY = event.globalY;

        const tileX = Math.floor((clickX - offsetX) / tileSize);
        const tileY = Math.floor((clickY - offsetY) / tileSize);

        // Check if valid tile
        if (
          tileX >= 0 &&
          tileX < currentMap.width &&
          tileY >= 0 &&
          tileY < currentMap.height &&
          currentMap.tiles[tileY][tileX].walkable
        ) {
          // Update position
          setPlayerPosition({ x: tileX, y: tileY });

          // Move sprite
          if (characterSpriteRef.current) {
            const newX = offsetX + tileX * tileSize + tileSize / 2;
            const newY = offsetY + tileY * tileSize + tileSize / 2;
            characterSpriteRef.current.position.set(newX, newY);
          }
        }
      });

      // Game loop for animations
      app.ticker.add(() => {
        // Future: Add idle animations, effects, etc.
      });
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height, currentMap, createMapLayer, createPlayerSprite, createUIOverlay, playerPosition]);

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl"
      style={{ width, height }}
    />
  );
}
