const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.getQTasks = async (req, res) => {
  try {
    const qtasks = await prisma.qtask.findMany({ where: { userId: Number(req.userId) } });
    res.json(qtasks);
  } catch {
    res.status(500).json({ message: 'Failed to fetch qtasks' });
  }
};
exports.createQTask = async (req, res) => {
  const { date, workTasks, personalTasks, notes, timeSpent } = req.body;

  console.log("Incoming Quick Task Body:", req.body);
  console.log("User ID from token:", req.userId);

  try {
    const qtask = await prisma.qtask.create({
      data: {
        date: new Date(date),
        workTasks: workTasks.join(', '),
        personalTasks: personalTasks.join(', '),
        notes,
        timeSpent,
        userId: Number(req.userId),
      },
    });

    console.log(" TimeLog created:", qtask);
    res.status(201).json(qtask);
  } catch (err) {
    console.error("Error inside TimeLog:", err);
    res.status(500).json({ message: 'Failed to create qtask', error: err.message });
  }
};
