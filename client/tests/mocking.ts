import { TokenCircle, TokenImage, TokenLine, TokenRectangle } from "../src/models/token";
import { User } from "../src/models/user";

function getRect(
  name = "Test Rect",
  border: number | null = null,
  x = 0,
  y = 0,
  w = 64,
  h = 64,
  r = 0,
): TokenRectangle {
  return {
    id: crypto.randomUUID(),
    name,
    type: "rectangle",
    color: "#ff00ff",
    border,
    x,
    y,
    w,
    h,
    r,
  };
}

function getCircle(
  name = "Test Circle",
  border: number | null = null,
  x = 0,
  y = 0,
  w = 64,
  h = 64,
  r = 0,
): TokenCircle {
  return {
    id: crypto.randomUUID(),
    name,
    type: "circle",
    color: "#00ffff",
    border,
    x,
    y,
    w,
    h,
    r,
  };
}

function getLine(name = "Test Line", stroke = 4, x = 0, y = 0, w = 64, h = 64, r = 0): TokenLine {
  return {
    id: crypto.randomUUID(),
    name,
    type: "line",
    color: "#ffff00",
    stroke,
    x,
    y,
    w,
    h,
    r,
  };
}

function getImage(
  name = "Test Circle",
  href = "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=200",
  x = 0,
  y = 0,
  w = 64,
  h = 64,
  r = 0,
): TokenImage {
  return {
    id: crypto.randomUUID(),
    name,
    type: "image",
    href,
    x,
    y,
    w,
    h,
    r,
  };
}

export const tokenMock = { getRect, getCircle, getLine, getImage };

function getUser(name = "User", color = "#ffffff"): User {
  return {
    id: crypto.randomUUID(),
    name,
    color,
  };
}

export const mockUser = { getUser };
