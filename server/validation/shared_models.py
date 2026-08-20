from pydantic import Field, RootModel

from validation import CradleBaseModel


class LangVersion(CradleBaseModel):
    """Mirrors a single row of the lang_version_v2 table."""

    string_id: str
    lang: str = Field("English")
    text: str


class MultiLangText(RootModel[dict[str, str]]):
    """
    Represents multilingual text like:
    {"english": "Hello", "french": "Bonjour"}

    Shared between forms V2 and workflows - both resolve translatable fields
    through the same lang_version_v2 table, so this wire shape isn't
    form-specific despite originally living in formsV2_models.py.
    """
