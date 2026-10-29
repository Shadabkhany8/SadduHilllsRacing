import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { GameEngine } from '@/game/GameEngine';

interface GameRendererProps {
  engine: GameEngine;
  width: number;
  height: number;
}

export const GameRenderer: React.FC<GameRendererProps> = ({ engine, width, height }) => {
  const { camera, terrain, vehiclePhysics, vehicleConfig, environmentConfig, particles, floatingTexts } =
    engine;
  const { chassis, rearWheel, frontWheel } = vehiclePhysics.state;

  // 1. Calculate terrain visible range in world coordinates
  const worldLeft = camera.toWorld(0, 0, width, height).x - 60;
  const worldRight = camera.toWorld(width, 0, width, height).x + 80;

  // 2. Generate terrain points for foreground surface
  const terrainPoints = terrain.getTerrainPoints(worldLeft, worldRight, environmentConfig.terrainStep);

  // Build foreground SVG path
  let terrainPathD = '';
  if (terrainPoints.length > 0) {
    const firstScreen = camera.toScreen(terrainPoints[0].x, terrainPoints[0].y, width, height);
    terrainPathD = `M ${firstScreen.x.toFixed(1)} ${firstScreen.y.toFixed(1)}`;

    for (let i = 1; i < terrainPoints.length; i++) {
      const sp = camera.toScreen(terrainPoints[i].x, terrainPoints[i].y, width, height);
      terrainPathD += ` L ${sp.x.toFixed(1)} ${sp.y.toFixed(1)}`;
    }

    // Close path to bottom of screen for soil fill
    const lastScreen = camera.toScreen(
      terrainPoints[terrainPoints.length - 1].x,
      terrainPoints[terrainPoints.length - 1].y,
      width,
      height
    );
    terrainPathD += ` L ${lastScreen.x.toFixed(1)} ${height + 20} L ${firstScreen.x.toFixed(1)} ${height + 20} Z`;
  }

  // 3. Parallax Layer 1: Distant Mountains (0.15x speed)
  const mountainParallaxX = -camera.x * 0.15 * camera.zoom;
  let mountainPathD = `M -20 ${height * 0.72}`;
  const mStep = 90;
  for (let sx = -40; sx <= width + 120; sx += mStep) {
    const worldApprox = (sx - mountainParallaxX) / 120;
    const mHeight =
      height * 0.58 +
      Math.sin(worldApprox * 0.8) * 45 +
      Math.sin(worldApprox * 1.7 + 1.2) * 25;
    mountainPathD += ` L ${sx.toFixed(1)} ${mHeight.toFixed(1)}`;
  }
  mountainPathD += ` L ${width + 40} ${height} L -20 ${height} Z`;

  // 4. Parallax Layer 2: Mid-ground rolling hills (0.35x speed)
  const midHillParallaxX = -camera.x * 0.35 * camera.zoom;
  let midHillPathD = `M -20 ${height * 0.8}`;
  const hStep = 70;
  for (let sx = -40; sx <= width + 100; sx += hStep) {
    const worldApprox = (sx - midHillParallaxX) / 90;
    const hHeight =
      height * 0.65 +
      Math.sin(worldApprox * 0.9 + 2.1) * 35 +
      Math.cos(worldApprox * 1.5) * 20;
    midHillPathD += ` L ${sx.toFixed(1)} ${hHeight.toFixed(1)}`;
  }
  midHillPathD += ` L ${width + 40} ${height} L -20 ${height} Z`;

  // 5. Sun or Moon coordinates (fixed celestial parallax)
  const sunScreenX = width * 0.82 - (camera.x * 0.02);
  const sunScreenY = height * 0.22;

  // 6. Vehicle screen transformation
  const chassisScreen = camera.toScreen(chassis.x, chassis.y, width, height);
  const rearScreen = camera.toScreen(rearWheel.x, rearWheel.y, width, height);
  const frontScreen = camera.toScreen(frontWheel.x, frontWheel.y, width, height);
  const scale = camera.zoom;

  // Active Collectibles in view
  const collectibles = terrain.getCollectiblesInRange(worldLeft, worldRight);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Sky Gradient */}
          <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={environmentConfig.skyColors[0]} />
            <Stop offset="100%" stopColor={environmentConfig.skyColors[1]} />
          </LinearGradient>

          {/* Terrain Soil Gradient */}
          <LinearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={environmentConfig.terrainSubsurfaceColor} />
            <Stop offset="18%" stopColor={environmentConfig.terrainSoilColor} />
            <Stop offset="100%" stopColor={environmentConfig.soilPatternColor} />
          </LinearGradient>

          {/* Coin Gold Gradient */}
          <LinearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF3B0" />
            <Stop offset="50%" stopColor="#FFD166" />
            <Stop offset="100%" stopColor="#E09F3E" />
          </LinearGradient>

          {/* Fuel Canister Gradient */}
          <LinearGradient id="fuelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EF233C" />
            <Stop offset="100%" stopColor="#9E2A2B" />
          </LinearGradient>

          {/* Wheel Tire Gradient */}
          <LinearGradient id="tireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#495057" />
            <Stop offset="60%" stopColor="#212529" />
            <Stop offset="100%" stopColor="#101214" />
          </LinearGradient>
        </Defs>

        {/* 1. SKY BACKDROP */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#skyGrad)" />

        {/* 2. SUN / MOON */}
        <Circle
          cx={sunScreenX}
          cy={sunScreenY}
          r={environmentConfig.sunOrMoon.radius * 1.5}
          fill={environmentConfig.sunOrMoon.glowColor}
        />
        <Circle
          cx={sunScreenX}
          cy={sunScreenY}
          r={environmentConfig.sunOrMoon.radius}
          fill={environmentConfig.sunOrMoon.color}
        />

        {/* 3. PARALLAX DISTANT MOUNTAINS */}
        <Path d={mountainPathD} fill={environmentConfig.distantMountainColor} opacity={0.65} />

        {/* 4. PARALLAX MID-GROUND HILLS */}
        <Path d={midHillPathD} fill={environmentConfig.midHillColor} opacity={0.82} />

        {/* 5. FOREGROUND TERRAIN SOIL */}
        {terrainPathD ? (
          <Path
            d={terrainPathD}
            fill="url(#soilGrad)"
            stroke={environmentConfig.terrainSurfaceColor}
            strokeWidth={8 * scale}
            strokeLinejoin="round"
          />
        ) : null}

        {/* 6. COLLECTIBLES */}
        {collectibles.map((item) => {
          if (item.collected) return null;
          const sp = camera.toScreen(item.x, item.y, width, height);

          if (item.type === 'coin') {
            const r = item.radius * scale;
            return (
              <G key={item.id} x={sp.x} y={sp.y}>
                {/* Glow halo */}
                <Circle cx={0} cy={0} r={r * 1.3} fill="rgba(255, 209, 102, 0.3)" />
                {/* Outer rim */}
                <Circle cx={0} cy={0} r={r} fill="url(#coinGrad)" stroke="#FFE494" strokeWidth={1.5} />
                {/* Inner ring */}
                <Circle cx={0} cy={0} r={r * 0.65} fill="none" stroke="#B07D1E" strokeWidth={1.2} />
                {/* Coin Star Inscription */}
                <SvgText
                  x={0}
                  y={4 * scale}
                  fontSize={11 * scale}
                  fontWeight="bold"
                  fill="#785006"
                  textAnchor="middle">
                  ★
                </SvgText>
              </G>
            );
          } else {
            // Fuel Jerry Can
            const r = item.radius * scale;
            const w = r * 1.8;
            const h = r * 2.2;
            return (
              <G key={item.id} x={sp.x} y={sp.y}>
                {/* Fuel Glow */}
                <Circle cx={0} cy={0} r={r * 1.4} fill="rgba(239, 35, 60, 0.35)" />
                {/* Canister Body */}
                <Rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  rx={4 * scale}
                  fill="url(#fuelGrad)"
                  stroke="#FFE5D9"
                  strokeWidth={1.5}
                />
                {/* Canister Handle */}
                <Rect
                  x={-w * 0.32}
                  y={-h / 2 - 4 * scale}
                  width={w * 0.64}
                  height={4 * scale}
                  rx={2 * scale}
                  fill="#780000"
                />
                {/* Label */}
                <SvgText
                  x={0}
                  y={2 * scale}
                  fontSize={8 * scale}
                  fontWeight="900"
                  fill="#FFFFFF"
                  textAnchor="middle">
                  GAS
                </SvgText>
              </G>
            );
          }
        })}

        {/* 7. VEHICLE SUSPENSION STRUTS */}
        {/* Rear Strut */}
        <Line
          x1={chassisScreen.x - (Math.cos(chassis.angle) * vehicleConfig.wheelBase * 0.5) * scale}
          y1={chassisScreen.y - (Math.sin(chassis.angle) * vehicleConfig.wheelBase * 0.5) * scale}
          x2={rearScreen.x}
          y2={rearScreen.y}
          stroke="#495057"
          strokeWidth={4.5 * scale}
          strokeLinecap="round"
        />
        {/* Front Strut */}
        <Line
          x1={chassisScreen.x + (Math.cos(chassis.angle) * vehicleConfig.wheelBase * 0.5) * scale}
          y1={chassisScreen.y + (Math.sin(chassis.angle) * vehicleConfig.wheelBase * 0.5) * scale}
          x2={frontScreen.x}
          y2={frontScreen.y}
          stroke="#495057"
          strokeWidth={4.5 * scale}
          strokeLinecap="round"
        />

        {/* 8. VEHICLE CHASSIS */}
        <G
          x={chassisScreen.x}
          y={chassisScreen.y}
          rotation={(chassis.angle * 180) / Math.PI}
          originX={0}
          originY={0}>
          {/* Headlight beam */}
          <Polygon
            points={`${vehicleConfig.chassisWidth * 0.45 * scale},${-8 * scale} ${vehicleConfig.chassisWidth * 1.5 * scale},${-22 * scale} ${vehicleConfig.chassisWidth * 1.5 * scale},${22 * scale} ${vehicleConfig.chassisWidth * 0.45 * scale},${8 * scale}`}
            fill="rgba(255, 255, 200, 0.18)"
          />

          {/* Main Chassis Body */}
          <Rect
            x={(-vehicleConfig.chassisWidth / 2) * scale}
            y={(-vehicleConfig.chassisHeight / 2) * scale}
            width={vehicleConfig.chassisWidth * scale}
            height={vehicleConfig.chassisHeight * scale}
            rx={8 * scale}
            fill={vehicleConfig.bodyPrimaryColor}
            stroke={vehicleConfig.bodySecondaryColor}
            strokeWidth={2.5 * scale}
          />

          {/* Cockpit Canopy / Windshield */}
          <Polygon
            points={`${(-vehicleConfig.chassisWidth * 0.15) * scale},${(-vehicleConfig.chassisHeight * 0.45) * scale} ${(vehicleConfig.chassisWidth * 0.18) * scale},${(-vehicleConfig.chassisHeight * 0.45) * scale} ${(vehicleConfig.chassisWidth * 0.32) * scale},${(-vehicleConfig.chassisHeight * 0.1) * scale} ${(-vehicleConfig.chassisWidth * 0.28) * scale},${(-vehicleConfig.chassisHeight * 0.1) * scale}`}
            fill={vehicleConfig.cockpitColor}
            stroke="#FFFFFF"
            strokeWidth={1.5 * scale}
            opacity={0.88}
          />

          {/* Driver Character */}
          <G x={(-vehicleConfig.chassisWidth * 0.05) * scale} y={(-vehicleConfig.chassisHeight * 0.5) * scale}>
            {/* Driver Head / Helmet */}
            <Circle cx={0} cy={-8 * scale} r={8 * scale} fill={vehicleConfig.accentColor} stroke="#212529" strokeWidth={1.5} />
            {/* Visor / Goggles */}
            <Rect x={1 * scale} y={-10 * scale} width={7 * scale} height={4 * scale} rx={1.5} fill="#212529" />
          </G>

          {/* Rear Spoiler / Wing */}
          <Rect
            x={(-vehicleConfig.chassisWidth * 0.52) * scale}
            y={(-vehicleConfig.chassisHeight * 0.6) * scale}
            width={12 * scale}
            height={4 * scale}
            rx={1.5}
            fill={vehicleConfig.accentColor}
          />
          <Line
            x1={(-vehicleConfig.chassisWidth * 0.48) * scale}
            y1={(-vehicleConfig.chassisHeight * 0.6) * scale}
            x2={(-vehicleConfig.chassisWidth * 0.46) * scale}
            y2={(-vehicleConfig.chassisHeight * 0.4) * scale}
            stroke="#212529"
            strokeWidth={2 * scale}
          />

          {/* Racing Stripe Accent */}
          <Rect
            x={(-vehicleConfig.chassisWidth * 0.45) * scale}
            y={-3 * scale}
            width={vehicleConfig.chassisWidth * 0.9 * scale}
            height={6 * scale}
            fill={vehicleConfig.accentColor}
          />
        </G>

        {/* 9. REAR WHEEL */}
        <G
          x={rearScreen.x}
          y={rearScreen.y}
          rotation={(rearWheel.angle * 180) / Math.PI}
          originX={0}
          originY={0}>
          {/* Tire rubber */}
          <Circle
            cx={0}
            cy={0}
            r={rearWheel.radius * scale}
            fill="url(#tireGrad)"
            stroke="#343A40"
            strokeWidth={2.5 * scale}
          />
          {/* Wheel Rim */}
          <Circle
            cx={0}
            cy={0}
            r={rearWheel.radius * 0.62 * scale}
            fill={vehicleConfig.wheelRimColor}
            stroke="#212529"
            strokeWidth={1.5 * scale}
          />
          {/* Rim Spokes */}
          <Line x1={-rearWheel.radius * 0.5 * scale} y1={0} x2={rearWheel.radius * 0.5 * scale} y2={0} stroke="#212529" strokeWidth={2 * scale} />
          <Line x1={0} y1={-rearWheel.radius * 0.5 * scale} x2={0} y2={rearWheel.radius * 0.5 * scale} stroke="#212529" strokeWidth={2 * scale} />
          {/* Center Hub Nut */}
          <Circle cx={0} cy={0} r={3 * scale} fill="#F8F9FA" />
        </G>

        {/* 10. FRONT WHEEL */}
        <G
          x={frontScreen.x}
          y={frontScreen.y}
          rotation={(frontWheel.angle * 180) / Math.PI}
          originX={0}
          originY={0}>
          {/* Tire rubber */}
          <Circle
            cx={0}
            cy={0}
            r={frontWheel.radius * scale}
            fill="url(#tireGrad)"
            stroke="#343A40"
            strokeWidth={2.5 * scale}
          />
          {/* Wheel Rim */}
          <Circle
            cx={0}
            cy={0}
            r={frontWheel.radius * 0.62 * scale}
            fill={vehicleConfig.wheelRimColor}
            stroke="#212529"
            strokeWidth={1.5 * scale}
          />
          {/* Rim Spokes */}
          <Line x1={-frontWheel.radius * 0.5 * scale} y1={0} x2={frontWheel.radius * 0.5 * scale} y2={0} stroke="#212529" strokeWidth={2 * scale} />
          <Line x1={0} y1={-frontWheel.radius * 0.5 * scale} x2={0} y2={frontWheel.radius * 0.5 * scale} stroke="#212529" strokeWidth={2 * scale} />
          {/* Center Hub Nut */}
          <Circle cx={0} cy={0} r={3 * scale} fill="#F8F9FA" />
        </G>

        {/* 11. PARTICLES (Dust, Glints, Smoke, Sparks) */}
        {particles.map((p) => {
          const sp = camera.toScreen(p.x, p.y, width, height);
          return (
            <Circle
              key={p.id}
              cx={sp.x}
              cy={sp.y}
              r={p.size * scale}
              fill={p.color}
              opacity={p.alpha}
            />
          );
        })}

        {/* 12. FLOATING TEXT POPUPS */}
        {floatingTexts.map((t) => {
          const sp = camera.toScreen(t.x, t.y, width, height);
          return (
            <SvgText
              key={t.id}
              x={sp.x}
              y={sp.y}
              fontSize={t.fontSize * scale}
              fontWeight="900"
              fill={t.color}
              stroke="#000000"
              strokeWidth={2}
              textAnchor="middle">
              {t.text}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
