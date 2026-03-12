namespace Server.Grid;

public class Offset(int x, int y)
{
    public int x = x;
    public int y = y;
}

public class Grid(int size, int offsetX, int offsetY)
{
    public int size = size;
    public Offset offset = new(offsetX, offsetY);

    public Grid Clone()
    {
        return new Grid(size, offset.x, offset.y);
    }
}
