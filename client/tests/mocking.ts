import { TokenCircle, TokenImage, TokenLine, TokenRectangle } from "../src/models/token";
import { User } from "../src/models/user";

type BaseOverrides = {
  name?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
  color?: string;
};

function getRect(overrides: BaseOverrides & { border?: number | null } = {}): TokenRectangle {
  return {
    id: crypto.randomUUID(),
    name: "Test Rect",
    type: "rectangle",
    color: "#ff00ff",
    border: null,
    x: 0,
    y: 0,
    w: 64,
    h: 64,
    r: 0,
    ...overrides,
  };
}

function getCircle(overrides: BaseOverrides & { border?: number | null } = {}): TokenCircle {
  return {
    id: crypto.randomUUID(),
    name: "Test Circle",
    type: "circle",
    color: "#00ffff",
    border: null,
    x: 0,
    y: 0,
    w: 64,
    h: 64,
    r: 0,
    ...overrides,
  };
}

function getLine(overrides: BaseOverrides & { stroke?: number } = {}): TokenLine {
  return {
    id: crypto.randomUUID(),
    name: "Test Line",
    type: "line",
    color: "#ffff00",
    stroke: 4,
    x: 0,
    y: 0,
    w: 64,
    h: 64,
    r: 0,
    ...overrides,
  };
}

function getImage(overrides: BaseOverrides & { href?: string } = {}): TokenImage {
  return {
    id: crypto.randomUUID(),
    name: "Test Image",
    type: "image",
    href: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=200",
    x: 0,
    y: 0,
    w: 64,
    h: 64,
    r: 0,
    ...overrides,
  };
}

const tokenMock = { getRect, getCircle, getLine, getImage };
export default tokenMock;

function getUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    name: "User",
    color: "#ffffff",
    ...overrides,
  };
}

export const mockUser = { getUser };
