from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[2]
DOCX = ROOT / "WorkBuddy实训系统需求文档.docx"
OUTPUT = ROOT / "WorkBuddy实训系统需求文档_完成课程规则更新.docx"

REPLACEMENTS = {
    "完成任务：到达课程最后一个任务且无后续任务时，下一任务按钮变成【完成本章并释放寻桌面】，点击完成后，按钮变为已到课程末尾":
        "完成课程：到达课程最后一个任务且课程内所有章节所有任务均为已完成后，显示【完成课程并释放虚拟桌面】；课程仍有未完成任务时不可执行该操作。",
    "章节完成与释放": "课程完成与释放",
    "系统按章节汇总章级任务及各小节任务的完成状态，包括跳过完成。":
        "系统汇总课程内所有章节、章级任务及各小节任务的完成状态，包括跳过完成。",
    "完成本章并释放虚拟桌面：章节内全部任务均为已完成后，可执行“完成本章并释放虚拟桌面”。":
        "完成课程并释放虚拟桌面：课程内所有章节所有任务均为已完成后，可执行“完成课程并释放虚拟桌面”。",
    "": "点击“完成课程并释放虚拟桌面”后，系统进行二次确认，提示【完成课程会释放虚拟桌面，删除D盘文件，是否继续。】",
    "从章节最后一个任务进入下一章时，如本章任务已全部完成，系统先完成本章并释放当前虚拟桌面，再进入下一章任务。":
        "从章节最后一个任务进入下一章时，不释放虚拟桌面；仅在课程内所有章节所有任务均为已完成且学生确认完成课程后，释放虚拟桌面并删除 D 盘文件。",
    "查看已完成的章节：右侧区域展示章节已完成，并明确提示“虚拟桌面已释放”；提示下方提供“重新启动虚拟桌面”按钮，点击后恢复当前任务的虚拟桌面并重新执行启动过渡，章节完成状态保持不变。点击【下一任务】进入下一章节":
        "完成课程后，右侧区域展示“课程已完成”，并明确提示“虚拟桌面运行资源已释放，D 盘文件已删除”。",
    "鼠标不动超过10分钟，释放提示仅在当前任务所属章节已完成且当前任务已完成时展示；进入其他未完成任务时必须恢复“WorkBuddy 虚拟桌面”并执行正常启动过渡。":
        "课程未完成时，进入其他任务不得触发课程完成释放；仅完成课程并通过二次确认后展示释放结果。",
}


def main() -> None:
    document = Document(DOCX)
    changed = []

    for index, paragraph in enumerate(document.paragraphs):
        if index == 284:
            if paragraph.text:
                raise RuntimeError(f"Paragraph 284 is no longer blank: {paragraph.text!r}")
            paragraph.text = REPLACEMENTS[""]
            paragraph.style = "List Paragraph"
            changed.append(index)
            continue

        if not paragraph.text:
            continue
        replacement = REPLACEMENTS.get(paragraph.text)
        if replacement is None:
            continue
        paragraph.text = replacement
        changed.append(index)

    expected = [256, 281, 282, 283, 284, 285, 286, 288]
    if changed != expected:
        raise RuntimeError(f"Unexpected changed paragraphs: {changed}; expected {expected}")

    document.save(OUTPUT)
    print(f"updated_paragraphs={changed}")
    print(OUTPUT)


if __name__ == "__main__":
    main()
