import { Icon } from "./icons";

export function CurioArt() {
  return <div className="curio-art" aria-hidden="true">
    <svg className="contour-map" viewBox="0 0 500 400" fill="none">
      <g stroke="currentColor" strokeWidth="1">
        <path d="M-60 55C60-75 150 120 260 38S400-45 560 25M-60 75C60-55 150 140 260 58S400-25 560 45M-60 95C60-35 150 160 260 78S400-5 560 65M-60 115C60-15 150 180 260 98S400 15 560 85M-60 135C60 5 150 200 260 118S400 35 560 105M-60 155C60 25 150 220 260 138S400 55 560 125M-60 175C60 45 150 240 260 158S400 75 560 145M-60 195C60 65 150 260 260 178S400 95 560 165M-60 215C60 85 150 280 260 198S400 115 560 185M-60 235C60 105 150 300 260 218S400 135 560 205M-60 255C60 125 150 320 260 238S400 155 560 225M-60 275C60 145 150 340 260 258S400 175 560 245M-60 295C60 165 150 360 260 278S400 195 560 265M-60 315C60 185 150 380 260 298S400 215 560 285M-60 335C60 205 150 400 260 318S400 235 560 305M-60 355C60 225 150 420 260 338S400 255 560 325M-60 375C60 245 150 440 260 358S400 275 560 345M-60 395C60 265 150 460 260 378S400 295 560 365" />
      </g>
    </svg>
    <div className="curio-logotype"><Icon name="compass" /><span>curio</span></div>
    <span className="curio-art-caption">A little curiosity goes a long way.</span>
    <div className="map-coordinate coordinate-one">DISCOVER</div><div className="map-coordinate coordinate-two">YOUR OWN WAY</div>
  </div>;
}
