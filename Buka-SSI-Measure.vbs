Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

batFile = scriptDir & "\SSI-Measure.bat"
WshShell.Run "cmd /c """ & batFile & """", 0, False
